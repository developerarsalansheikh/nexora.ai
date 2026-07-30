import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export function FormSuccess({ message }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2.5 p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400 text-xs font-medium text-left"
    >
      <FiCheckCircle size={15} className="shrink-0 mt-0.5" />
      <span className="leading-normal tracking-wide">{message}</span>
    </motion.div>
  );
}

export default FormSuccess;
