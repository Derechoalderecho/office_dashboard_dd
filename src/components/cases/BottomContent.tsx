import { Pagination } from "@heroui/react";

interface BottomContentProps {
  selectedKeys: string;
  selectedKeysSize: number;
  filteredItemsLenght: number;
  page: number;
  pages: number;
  setPage: (page: number) => void;
}

export default function BottomContent({
  selectedKeys,
  selectedKeysSize,
  filteredItemsLenght,
  page,
  pages,
  setPage,
}: BottomContentProps) {
  return (
    <div className="py-2 px-2 flex justify-between items-center">
      <span className="w-[30%] text-small text-default-400">
        {selectedKeys === "all"
          ? "Todos los casos seleccionados"
          : `${selectedKeysSize} de ${filteredItemsLenght} seleccionado`}
      </span>
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={pages}
        onChange={setPage}
      />
    </div>
  );
}
