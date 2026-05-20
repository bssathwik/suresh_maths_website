import React from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Subject } from '../data/mockData';

interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  const IconComponent = (Icons as any)[subject.icon];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center gap-4"
    >
      <div className={`p-4 rounded-2xl ${subject.color} text-white shadow-lg shadow-${subject.color.split('-')[1]}-200 group-hover:scale-110 transition-transform`}>
        {IconComponent && <IconComponent size={32} />}
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{subject.name}</h3>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          {subject.classes ? `Classes ${Object.keys(subject.classes).join(', ')}` : 'Digital Materials'}
        </p>
      </div>
    </motion.div>
  );
};

export default SubjectCard;
