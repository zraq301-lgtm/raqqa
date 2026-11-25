import React from 'react';
import TrainingLinksSection from './TrainingLinksSection';

// Kept as a compatibility wrapper for older imports; training records now come from D1.
export default function MiniCourseTraining({ section = 'دروب التمكين' }) {
  return <TrainingLinksSection section={section} />;
}
