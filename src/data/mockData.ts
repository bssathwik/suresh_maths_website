export interface Resource {
  id: string;
  title: string;
  chapter?: string;
  type: 'pdf' | 'worksheet' | 'youtube';
  url: string;
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface WorksheetItem {
  id: string;
  question: string;
  correctAnswer: string;
}

export interface Worksheet {
  id: string;
  title: string;
  items: WorksheetItem[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  classes: {
    [className: string]: {
      resources: Resource[];
      quizzes: {
        id: string;
        title: string;
        questions: Question[];
      }[];
      worksheets?: Worksheet[];
    };
  };
}

const emptyClassData = {
  resources: [],
  quizzes: [],
  worksheets: []
};

export const subjects: Subject[] = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: 'Calculator',
    color: 'bg-blue-500',
    classes: {
      'VI': {
        resources: [
          { id: 'm-6-1-1', title: 'Chapter 1: 1. PATTERNS IN MATHEMATICS - PDF Notes', chapter: 'Chapter 1: 1. PATTERNS IN MATHEMATICS', type: 'pdf', url: 'https://drive.google.com/file/d/1vYYC6JHmfW9_NIrgxYq4MFgdBHEyEizc/view?usp=drive_link', description: 'Comprehensive notes on large numbers and estimation.' },
          { id: 'm-6-1-2', title: 'Chapter 1: 1. PATTERNS IN MATHEMATICS - Video', chapter: 'Chapter 1: Knowing Our Numbers', type: 'youtube', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Video session explaining place values.' },
          { id: 'm-6-2-1', title: 'Chapter 2: Whole Numbers - Introduction', chapter: 'Chapter 2: Whole Numbers', type: 'pdf', url: '#', description: 'Detailed notes on whole numbers and properties.' }
        ],
        quizzes: [
          {
            id: 'math-6-q1',
            title: 'Class VI Chapter 1 Quiz',
            questions: [{ id: 'q61', text: 'Which is the smallest natural number?', options: ['0', '1', '2', 'None'], correctAnswer: 1 }]
          }
        ],
        worksheets: [
          { id: 'math-6-ws-1', title: 'Knowing Our Numbers Worksheet', items: [{ id: 'ws61', question: 'Successor of 999 is?', correctAnswer: '1000' }] }
        ]
      },
      'VII': {
        resources: [
          { id: 'm-7-1-1', title: 'Chapter 1: Integers - Concepts', chapter: 'Chapter 1: Integers', type: 'pdf', url: '#', description: 'Rules for addition and subtraction of integers.' },
          { id: 'm-7-2-1', title: 'Chapter 2: Fractions & Decimals', chapter: 'Chapter 2: Fractions & Decimals', type: 'pdf', url: '#', description: 'Operations on fractions and decimals explained.' }
        ],
        quizzes: [],
        worksheets: []
      },
      'VIII': {
        resources: [
          { id: 'm-8-1-1', title: 'Chapter 1: Rational Numbers', chapter: 'Chapter 1: Rational Numbers', type: 'pdf', url: '#', description: 'Properties of rational numbers.' },
          { id: 'm-8-2-1', title: 'Chapter 2: Linear Equations', chapter: 'Chapter 2: Linear Equations', type: 'pdf', url: '#', description: 'Solving linear equations in one variable.' }
        ],
        quizzes: [],
        worksheets: []
      },
      'IX': {
        resources: [
          { id: 'm-9-1-1', title: 'Chapter 1: Number Systems', chapter: 'Chapter 1: Number Systems', type: 'pdf', url: '#', description: 'Irrational numbers and real numbers notes.' },
          { id: 'm-9-2-1', title: 'Chapter 2: Polynomials', chapter: 'Chapter 2: Polynomials', type: 'pdf', url: '#', description: 'Reminders and factor theorem explained.' }
        ],
        quizzes: [],
        worksheets: []
      },
      'X': {
        resources: [
          { id: 'm-10-1-1', title: 'Chapter 1: Real Numbers', chapter: 'Chapter 1: Real Numbers', type: 'pdf', url: '#', description: 'Euclid\'s Division Lemma and fundamental theorem of arithmetic.' },
          { id: 'm-10-8-1', title: 'Chapter 8: Trigonometry - Basics', chapter: 'Chapter 8: Trigonometry', type: 'pdf', url: '#', description: 'Trigonometric ratios and identities.' },
          { id: 'm-10-8-2', title: 'Trigonometry Video Tutorial', chapter: 'Chapter 8: Trigonometry', type: 'youtube', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Introduction to Sin, Cos, and Tan.' }
        ],
        quizzes: [
          {
            id: 'm-10-q1',
            title: 'Trigonometry Basics Quiz',
            questions: [{ id: 'q10-1', text: 'sin(90°) = ?', options: ['0', '1/2', '1', 'Not defined'], correctAnswer: 2 }]
          }
        ],
        worksheets: [
          { id: 'm-10-ws-1', title: 'Real Numbers Practice', items: [{ id: 'ws101', question: 'HCF of 24 and 36 is?', correctAnswer: '12' }] }
        ]
      }
    }
  },
  {
    id: 'science',
    name: 'Science',
    icon: 'FlaskConical',
    color: 'bg-emerald-500',
    classes: {
      'VI': { ...emptyClassData },
      'VII': { ...emptyClassData },
      'VIII': { ...emptyClassData },
      'IX': { ...emptyClassData },
      'X': {
        resources: [
          { id: 'sci-10-yt-1', title: 'Light Reflection', type: 'youtube', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Physics concepts for Class X.' }
        ],
        quizzes: [],
        worksheets: []
      }
    }
  },
  {
    id: 'english',
    name: 'English',
    icon: 'BookOpen',
    color: 'bg-purple-500',
    classes: {
      'VI': { ...emptyClassData },
      'VII': { ...emptyClassData },
      'VIII': { ...emptyClassData },
      'IX': { ...emptyClassData },
      'X': { ...emptyClassData }
    }
  },
  {
    id: 'social',
    name: 'Social Science',
    icon: 'Globe',
    color: 'bg-rose-500',
    classes: {
      'VI': { ...emptyClassData },
      'VII': { ...emptyClassData },
      'VIII': { ...emptyClassData },
      'IX': { ...emptyClassData },
      'X': { ...emptyClassData }
    }
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: 'Zap',
    color: 'bg-amber-500',
    classes: {
      'VI': { ...emptyClassData },
      'VII': { ...emptyClassData },
      'VIII': { ...emptyClassData },
      'IX': { ...emptyClassData },
      'X': { ...emptyClassData }
    }
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: 'FlaskConical',
    color: 'bg-cyan-500',
    classes: {
      'VI': { ...emptyClassData },
      'VII': { ...emptyClassData },
      'VIII': { ...emptyClassData },
      'IX': { ...emptyClassData },
      'X': { ...emptyClassData }
    }
  }
];
