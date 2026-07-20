# TOBESENIOR.md

A mentorship-style code review of the OTB Miraflores system: the recurring
junior patterns in this codebase, why each is a problem, how to fix it, and the
senior habits underneath. Written to learn from and apply incrementally — see
the **TODO plan** at the bottom for the commit-by-commit rollout.

> There's good instinct in this project: routers/services/models are separated,
> auth uses httponly cookies, login has timing-attack protection. The items
> below are what separate this from senior-level code.

---

## 1. A real bug that will crash: the `endode` typo

In `service/app/services/auth.py`:

```python
def hash_password(plain_text_password:str) -> str:
  password_bytes = plain_text_password.endode("utf-8")   # typo: endode
```

`str.endode` doesn't exist. The first time anyone registers/creates a user
through this function, it throws `AttributeError`. It has survived only because
users come from seed scripts, not this path.

**The lesson isn't "typo bad." It's: this function has never been executed.**
Senior habit — untested code is broken code until proven otherwise. One test
catches it:

```python
def test_hash_and_verify_roundtrip():
    h = hash_password("secret123")
    assert verify_password("secret123", h) is True
    assert verify_password("wrong", h) is False
```

`service/test/` is empty. Add `pytest`, write the roundtrip test.

---

## 2. The whole API is unauthenticated (the biggest one)

The frontend has `ProtectedRoute`, so it *feels* secure. But on the backend only
`/auth/me` depends on `get_current_user`. Every route in `routers/measures.py`
and `routers/neighbors.py` is **wide open** — anyone with the Render URL can read
every neighbor, delete measures, or generate debts. No cookie required.

**Junior misconception: frontend guards are UX, not security.** The client is
fully controllable by an attacker (curl, Postman, devtools). Authorization must
live on the server.

Fix — router-level dependency so it can't be forgotten per-endpoint:

```python
from app.dependencies import get_current_user

router = APIRouter(
  prefix="/measures",
  tags=["Measures"],
  dependencies=[Depends(get_current_user)],   # applies to every route here
)
```

If a route needs the user object, add
`current_user: User = Depends(get_current_user)` to that handler. Senior framing:
**make the secure path the default, and insecurity something you'd opt into visibly.**

---

## 3. Manual dict-building instead of `response_model` (the costliest pattern)

This is everywhere. Example from `routers/measures.py` `update_measure` — the
route already declares `response_model=schemas.Measure`, yet the body does:

```python
return {
  "id": db_measure.id,
  "measure_date": str(db_measure.measure_date),
  "period": db_measure.period,
  "reader_name": db_measure.reader_name,
  "status": db_measure.status,
  # ...10 more lines...
}
```

`read_neighbor_detail`, `get_neighbor_meters`, `get_neighbor_payments`,
`get_neighbor_active_debts`, `get_neighbor_all_debts` each hand-build dicts —
hundreds of lines of it.

**Why it's a problem:**
- Every field is duplicated: once in the model, once in the schema, once in the
  hand-built dict. Add a column → edit 3 places → forget one → silent bug.
- No validation on the way out; enums get `str()`'d inconsistently.
- It's why files are 300 lines when they should be 60.

Senior version — let Pydantic serialize the ORM object (you already do this in
`Measure` with `from_attributes = True` and a `field_validator`):

```python
@router.put("/{measure_id}", response_model=schemas.Measure)
def update_measure(measure_id: int, measure: schemas.MeasureUpdate,
                   db: Session = Depends(get_db)):
  db_measure = measures_service.update_measure(db, measure_id, measure)
  if db_measure is None:
    raise HTTPException(404, "Measure not found")
  return db_measure          # FastAPI + response_model does the rest
```

For nested cases (neighbor + meters, debts + totals), build **schemas** with
nested models — you already did it right in `NeighborDetail` and then didn't
reuse the instinct for the debt endpoints:

```python
class NeighborDetail(Neighbor):
    meters: list[NeighborMeter]
```

**The rule: the shape of an API response is a schema's job, never a handler's.**

---

## 4. Business logic living in the router

`generate_debts_from_measure` is ~90 lines *inside the route handler* — DB
queries, a billing algorithm, N+1 loops, and `from datetime import date`
imported mid-loop.

**a) It can't be tested or reused.** Move it to `services/`:

```python
# routers/measures.py
@router.post("/{measure_id}/generate-debts")
def generate_debts(measure_id: int, db: Session = Depends(get_db)):
    return debts_service.generate_from_measure(db, measure_id)

# services/debts.py  — pure logic, unit-testable
def generate_from_measure(db, measure_id) -> DebtGenerationResult:
    ...
```

**b) N+1 queries.** The loop touches `reading.meter.neighbor_id`,
`reading.meter.neighbor.first_name` — each a fresh SELECT. For 200 meters that's
400+ round-trips. Eager-load once:

```python
readings = (
    db.query(MeterReading)
    .options(joinedload(MeterReading.meter).joinedload(NeighborMeter.neighbor))
    .filter(MeterReading.measure_id == measure_id)
    .all()
)
```

**c) The "previous reading" logic is subtly wrong:**

```python
previous_reading = db.query(MeterReading).filter(
    MeterReading.meter_id == reading.meter_id,
    MeterReading.id < reading.id            # assumes id order == time order
).order_by(MeterReading.id.desc()).first()
```

Using primary-key order as a proxy for chronological order breaks on backfills,
history imports, or sequence resets. Order by the **domain field that means
"when"** (`measure.measure_date` / `period`). Also `consumption < 0` (meter
replaced/rolled over) is never handled — it silently bills a negative/huge amount.

**d) Imports inside loops.** `from datetime import date` belongs at file top.

**Senior framing: a route handler should read like a table of contents — parse
input, call a service, shape the response.**

---

## 5. Data modeling: phone numbers and money as `Integer`

In `models/neighbor.py`:

```python
ci = Column(Integer, nullable=True)
phone_number = Column(Integer, nullable=True)
```

And schema `phone_number: str | int`, then response `phone_number: int`.

**Phone numbers are not numbers.** Leading zeros (lost), `+`/country codes
(lost), can exceed 32-bit range, never used in arithmetic. Test: *would you ever
add two of them?* No → **string**. Same for `ci`. Store as `String`, validate
format with a Pydantic validator.

The `str | int` union is a second smell — it means the type isn't decided, so
ambiguity is pushed downstream and every consumer handles both. **Pick one type
at the boundary and coerce immediately.**

**Money** is sharper. Comments say `# en centavos` (cents) but billing assigns
`amount = 20` meaning *20 bolivianos*. Cents or bolivianos? Nobody knows — a
production incident waiting to happen. Rules:
- Never `float` for money (`0.1 + 0.2 != 0.3`).
- Pick one unit (integer cents is fine) and make it true *everywhere* — model,
  schema, logic — with the unit in the name (`amount_cents`).

---

## 6. `useFetchData` — the frontend's structural weak point

`client/src/hooks/useFetchData.ts` backs every data hook, so its flaws spread.

```typescript
const [isLoading, setIsLoading] = useState(true);   // true before any fetch
```

**a) `isLoading` starts `true`** even when nothing is loading → permanent spinner
for any consumer that doesn't fetch immediately.

**b) No cleanup / abort.** Unmount mid-request → `setData` on an unmounted
component; racing calls → the slower one wins (stale data). Fix with
`AbortController`:

```typescript
useEffect(() => {
  const controller = new AbortController();
  execute(url, { signal: controller.signal });
  return () => controller.abort();
}, [url]);
```

**c) Swallows the HTTP-error vs network-error distinction**, and callers
`console.log(data)` (see `useNewMeasure`). Leftover `console.log` in shipped code
is a classic tell.

**d) The bigger point:** this is a hand-rolled data layer missing the hard parts
(dedup, cache, retry, invalidation, race handling). That's what **TanStack Query
(React Query)** is for:

```typescript
export const useMeasures = () =>
  useQuery({
    queryKey: ["measures"],
    queryFn: () => fetch(`${apiLink}/measures`, { credentials: "include" }).then(r => r.json()),
  });
```

Loading/error/caching/refetch/dedup for free, correctly. **Knowing when *not* to
write code is a senior skill.**

Also in `useNewMeasure.ts`: `createNewMeasure` mixes `await` with `.then()`, and
`return true` lives inside the `.then` callback — so the outer function always
resolves to `undefined` and the caller can't tell if it succeeded. Pick
async/await, and actually return the result.

---

## 7. Craft & hygiene (small individually, "junior" collectively)

- **Duplicate config classes.** `_settings.py` and `core/settings.py` both define
  `Settings`. One is dead — delete it. Two sources of truth for config is how
  prod and dev silently diverge.
- **Unreachable code.** `read_neighbors` has a `return` followed by more code
  including a second `return {'Error': ...}` that can never run.
- **Commented-out code as version control.** Whole routers/models/routes are
  commented out across `main.py`, `main.tsx`, `models/__init__.py`, schemas.
  That's what **git** is for. Delete it; history remembers.
- **Deprecated `datetime.utcnow()`** (models) mixed with correct
  `datetime.now(timezone.utc)` (jwt) → naive vs aware datetime bugs. Standardize
  on timezone-aware.
- **`create_all` *and* Alembic.** `main.py` calls `Base.metadata.create_all`
  while you also run `alembic upgrade head`. Pick one. With migrations,
  `create_all` masks drift.
- **Routes declared in `main.tsx`.** Fine while tiny; extract a `routes.tsx`
  before it grows.

---

## How to *be* senior building this tool

The habits underneath the fixes:

1. **Single source of truth.** Every fact — a field's type, a config value, a
   response shape — lives in exactly one place. Manual dicts, `_settings.py`, and
   commented code all violate this. Typing the same field a third time? Extract.
2. **Push decisions to the boundary, then trust them inside.** Decide
   `phone_number` is a string *at the schema*, coerce once; the rest of the code
   never sees `str | int` again.
3. **Security is server-side and default-on.** Guards belong where the attacker
   can't reach. Structure so forgetting is impossible, not so remembering is
   required.
4. **If you can't test it, the design is wrong.** Logic welded to HTTP handlers
   can't be exercised in isolation. Extract to services → test → bugs surface
   before users do.
5. **Know the ecosystem so you write less.** React Query, Pydantic serialization,
   FastAPI dependencies — the senior move is often deleting your hand-rolled
   version. Code you don't write has no bugs.
6. **Leave the campsite cleaner.** No dead code, no console.logs, no "fix later"
   comments. Everything a reader sees should be live and intentional.

---

## TODO plan — rollout across the next commits

Ordered so each commit is small, self-contained, and reviewable. Safety/bug fixes
first, then the high-leverage refactors, then hygiene. Check items off as you go.

### Commit 1 — Safety net: tests + the crash bug
- [ ] Add `pytest` to `service` dev deps; create `service/test/conftest.py` with a SQLite test-db fixture.
- [ ] Fix `endode` → `encode` in `services/auth.py::hash_password`.
- [ ] Add `test_hash_and_verify_roundtrip` and a login-flow test.

### Commit 2 — Lock down the API (security)
- [ ] Add `dependencies=[Depends(get_current_user)]` to the `measures` router.
- [ ] Add the same to the `neighbors` router.
- [ ] Add a test asserting protected routes return 401 without a cookie.

### Commit 3 — Kill manual dict-building in measures
- [ ] Rewrite `update_measure` to `return db_measure` via `response_model`.
- [ ] Add a `MeterReadingWithNeighbor` schema; use it for the meter-readings route.
- [ ] Remove now-dead serialization code.

### Commit 4 — Kill manual dict-building in neighbors
- [ ] Reuse/extend `NeighborDetail`; drop the hand-built dict in `read_neighbor_detail`.
- [ ] Add nested schemas for meters/payments/debts; convert those endpoints.

### Commit 5 — Extract billing logic into a service
- [ ] Create `services/debts.py::generate_from_measure` (move logic out of the router).
- [ ] Eager-load meter→neighbor with `joinedload` (fix N+1).
- [ ] Order "previous reading" by `measure_date`/`period`, not `id`.
- [ ] Handle `consumption < 0` explicitly.
- [ ] Move loop-local imports to file top.
- [ ] Unit-test the billing rules (≤20 m³, >20 m³, negative, first reading).

### Commit 6 — Fix the data model
- [ ] Change `ci` and `phone_number` to `String` in the model (+ Alembic migration).
- [ ] Collapse `str | int` unions to `str` in schemas; add format validators.
- [ ] Decide the money unit; rename to `amount_cents` (or document bolivianos) and make it consistent across model/schema/logic.

### Commit 7 — Harden `useFetchData` / adopt React Query
- [ ] Decide: patch `useFetchData` (fix `isLoading` default + `AbortController`) **or** migrate to TanStack Query.
- [ ] Fix `useNewMeasure` to use async/await and return the real result.
- [ ] Remove leftover `console.log`s.

### Commit 8 — Hygiene sweep
- [ ] Delete `_settings.py`.
- [ ] Remove unreachable code in `read_neighbors`.
- [ ] Delete commented-out code across `main.py`, `main.tsx`, `models/__init__.py`, schemas.
- [ ] Replace `datetime.utcnow()` with `datetime.now(timezone.utc)` in models.
- [ ] Remove `Base.metadata.create_all` from `main.py`; rely on Alembic.
- [ ] Extract frontend routes into `routes.tsx`.
