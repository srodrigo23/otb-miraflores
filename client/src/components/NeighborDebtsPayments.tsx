import DebtsTable from "./tables/DebtsTable";
import { BanknotesIcon, CreditCardIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { Tabs, TabsHeader, Tab, TabsBody, TabPanel } from "@material-tailwind/react";


const PaymentsComponentNeighborPage = () => {
  return <>Table B</>;
};

const ConsumptionComponentNeighborPage = () => {
  return <>Table C</>;
};

export const NeighborDebtsPayments = ()=>{
  const dataTabs = [
    {
      label: 'Deudas',
      value: 'debts',
      component: <DebtsTable />,
      icon: <BanknotesIcon className='w-4 h-4' />,
    },
    {
      label: 'Pagos',
      value: 'payments',
      component: <PaymentsComponentNeighborPage />,
      icon: <CreditCardIcon className='w-4 h-4' />,
    },
    {
      label: 'Consumo',
      value: 'comsumption history',
      component: <ConsumptionComponentNeighborPage />,
      icon: <ChartBarIcon className='w-4 h-4' />,
    },
  ];

  return (
    <>
      <Tabs value='debts' className='h-full flex flex-col'>
        <TabsHeader>
          {dataTabs.map(({ label, value, icon }) => {
            return (
              <Tab key={value} value={value}>
                <div className='flex items-center gap-2'>
                  {icon}
                  <span className='font-semibold text-sm'>{label}</span>
                </div>
              </Tab>
            );
          })}
        </TabsHeader>
        <TabsBody className='flex-1 overflow-y-auto'>
          {dataTabs.map(({ value, component }) => (
            <TabPanel key={value} value={value} className='h-full px-1 py-2'>
              {component}
            </TabPanel>
          ))}
        </TabsBody>
      </Tabs>
    </>
  );
}
