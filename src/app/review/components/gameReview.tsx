import React, { useState, ChangeEvent } from 'react';
import dataEn from '../../../../public/review_templates/english.json';
import dataPt from '../../../../public/review_templates/portuguese.json';

const GameReview: React.FC<GameReviewProps> = ({ language }) => {
  const [data] = useState(() => (language === 'en' ? dataEn : dataPt));
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const handleOptionChange = (categoryTitle: string, option: string) => {
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [categoryTitle]: option,
    }));
  };

  const selectedChoices = Object.entries(selectedOptions).map(([category, option]) => `${category}: ${option}`);

  const areAllBoxesChecked = Object.values(selectedOptions).every((option) => !!option);

  const generateOutput = () => {
    if (areAllBoxesChecked) {
      const outputLines = Object.entries(selectedOptions).map(([category, option]) => {
        return `${category}: ${option}`;
      });
      console.log(outputLines.join('\n'));
    } else {
      console.log("Please check all boxes before generating output.");
    }
  };

  return (
    <main className="bg-black text-white min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-8 py-16 bg-gray-900">
      {data.categories.map((category: Category) => (
        <section key={category.title} className="rounded-lg shadow-md border p-4">
          <h2 className="text-2xl font-bold text-white mb-4">{category.title}</h2>
          <div className="grid grid-cols-2 gap-4">
          {category.options.map((option: string) => (
            <label key={option} className="flex items-center">
              <input
                type={category.type}
                value={option}
                checked={selectedOptions[category.title] === option}
                onChange={(e) => handleOptionChange(category.title, e.target.value)}
                className="mr-4 cursor-pointer rounded-md border border-gray-400 focus:ring-blue-500 focus:ring-2"
              />
              {option}
            </label>
          ))}
          </div>
        </section>
      ))}
      </div>
      <div className="flex items-center justify-center h-full mt-4">
      <div className="bg-gray-900 text-white rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Review</h2>
        <ul className='font-bold'>
          {selectedChoices.length > 0 &&
            selectedChoices.map((choice) => <li key={choice}>{choice}</li>)}
        </ul>
      </div>
    </div>
  </main>
);
};

export default GameReview;
