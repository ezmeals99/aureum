import React from "react";
import { Item } from "../../types";
import ItemCard from "./ItemCard";
import { motion } from "motion/react";

interface ItemGridProps {
  items: Item[];
}

const ItemGrid: React.FC<ItemGridProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ItemCard item={item} />
        </motion.div>
      ))}
    </div>
  );
};

export default ItemGrid;
