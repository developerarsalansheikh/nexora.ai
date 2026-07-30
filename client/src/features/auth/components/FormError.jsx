import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export function FormError({ message }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-medium text-left"
    >
      <FiAlertCircle size={15} className="shrink-0 mt-0.5" />
      <span className="leading-normal tracking-wide">{message}</span>
    </motion.div>
  );
}

export default FormError;
