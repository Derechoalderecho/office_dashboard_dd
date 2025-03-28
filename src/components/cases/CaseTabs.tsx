import { Tabs, Tab } from "@heroui/react";

interface CaseTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
}

export default function CaseTabs({ activeTab, onTabChange }: CaseTabsProps) {
  return (
    <Tabs 
      aria-label="Filtros de casos" 
      selectedKey={activeTab} 
      onSelectionChange={(key) => onTabChange(key as string)}
      className="mb-4"
    >
      <Tab
        key="all"
        title="Todos los casos"
      />
      <Tab
        key="my"
        title="Mis casos"
      />
    </Tabs>
  );
} 