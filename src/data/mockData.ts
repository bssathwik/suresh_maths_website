export interface Resource {
  id: string;
  title: string;
  chapter?: string;
  type: 'pdf' | 'worksheet' | 'youtube' | 'html';
  url: string;
  description?: string;
  category: 'notes' | 'worksheet' | 'model_paper' | 'interactive_learning';
  isSpecialAccess?: boolean;
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

export const subjects: Subject[] = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: 'Calculator',
    color: 'bg-blue-500',
    classes: {
      'VI': {
        resources: [
          { id: 'm-6-1-1', title: 'Chapter 1: 1. PATTERNS IN MATHEMATICS - PDF Notes', chapter: 'Chapter 1: 1. PATTERNS IN MATHEMATICS', type: 'pdf', url: 'https://drive.google.com/file/d/1vYYC6JHmfW9_NIrgxYq4MFgdBHEyEizc/view?usp=drive_link', description: 'Comprehensive notes on large numbers and estimation.', category: 'notes' },
          { id: 'm-6-2-1', title: 'Chapter 2: Whole Numbers - Introduction', chapter: 'Chapter 2: Whole Numbers', type: 'pdf', url: '#', description: 'Detailed notes on whole numbers and properties.', category: 'notes' },
          { id: 'm-6-ws-pdf', title: 'Chapter 1: Patterns in Mathematics - Worksheet', chapter: 'Chapter 1: 1. PATTERNS IN MATHEMATICS', type: 'pdf', url: '#', description: 'Practice pdf workload on patterns in mathematics.', category: 'worksheet' },
          { id: 'm-6-mp-1', title: 'Class VI Mathematics - Term End Model Paper', chapter: 'Model Question Papers', type: 'pdf', url: '#', description: 'Official style mock examination paper.', category: 'model_paper' }
        ],
        quizzes: [
          {
            id: 'math-6-q1',
            title: 'Class VI Chapter 1 Quiz',
            questions: [{ id: 'q61', text: 'Which is the smallest natural number?', options: ['0', '1', '2', 'None'], correctAnswer: 1 }]
          }
        ],
        worksheets: [
          { id: 'math-6-ws-1', title: 'Knowing Our Numbers Interactive Worksheet', items: [{ id: 'ws61', question: 'Successor of 999 is?', correctAnswer: '1000' }] }
        ]
      },
      'VII': {
        resources: [
          { id: 'm-7-1-1', title: 'Chapter 1: Integers - Concepts', chapter: 'Chapter 1: Integers', type: 'pdf', url: '#', description: 'Rules for addition and subtraction of integers.', category: 'notes' },
          { id: 'm-7-2-1', title: 'Chapter 2: Fractions & Decimals', chapter: 'Chapter 2: Fractions & Decimals', type: 'pdf', url: '#', description: 'Operations on fractions and decimals explained.', category: 'notes' },
          { id: 'm-7-ws-pdf', title: 'Chapter 1: Integers Practice Worksheet', chapter: 'Chapter 1: Integers', type: 'pdf', url: '#', description: 'Printable practice sums for math integers.', category: 'worksheet' },
          { id: 'm-7-mp-1', title: 'Class VII Summative Assessment Model Paper', chapter: 'Model Question Papers', type: 'pdf', url: '#', description: 'Mid-term model question paper with solutions.', category: 'model_paper' }
        ],
        quizzes: [
          {
            id: 'math-7-q1',
            title: 'Class VII Integers Quiz',
            questions: [{ id: 'q71', text: '(-5) + (-2) = ?', options: ['-7', '7', '-3', '3'], correctAnswer: 0 }]
          }
        ],
        worksheets: [
          { id: 'math-7-ws-1', title: 'Integers Algebra Worksheet', items: [{ id: 'ws71', question: 'Value of (-10) + (15) is?', correctAnswer: '5' }] }
        ]
      },
      'VIII': {
        resources: [
          { id: 'm-8-1-1', title: 'Chapter 1: Rational Numbers', chapter: 'Chapter 1: Rational Numbers', type: 'pdf', url: '#', description: 'Properties of rational numbers.', category: 'notes' },
          { id: 'm-8-2-1', title: 'Chapter 2: Linear Equations', chapter: 'Chapter 2: Linear Equations', type: 'pdf', url: '#', description: 'Solving linear equations in one variable.', category: 'notes' },
          { id: 'm-8-ws', title: 'Rational Numbers Standard Worksheet', chapter: 'Chapter 1: Rational Numbers', type: 'pdf', url: '#', description: 'Class assignment sheet for math practice.', category: 'worksheet' },
          { id: 'm-8-mp', title: 'Class VIII Board Style Model Paper', chapter: 'Model Question Papers', type: 'pdf', url: '#', description: 'Simulated standard board review syllabus paper.', category: 'model_paper' }
        ],
        quizzes: [],
        worksheets: []
      },
      'IX': {
        resources: [
          { id: 'm-9-1-1', title: 'Chapter 1: Number Systems', chapter: 'Chapter 1: Number Systems', type: 'pdf', url: '#', description: 'Irrational numbers and real numbers notes.', category: 'notes' },
          { id: 'm-9-2-1', title: 'Chapter 2: Polynomials', chapter: 'Chapter 2: Polynomials', type: 'pdf', url: '#', description: 'Reminders and factor theorem explained.', category: 'notes' },
          { id: 'm-9-mp-1', title: 'Class IX Annual Model Question Paper', chapter: 'Model Question Papers', type: 'pdf', url: '#', description: 'Comprehensive annual preparation test file.', category: 'model_paper' }
        ],
        quizzes: [],
        worksheets: []
      },
      'X': {
        resources: [
          { id: 'm-10-1-1', title: 'Chapter 1: Real Numbers', chapter: 'Chapter 1: Real Numbers', type: 'pdf', url: '#', description: 'Euclid\'s Division Lemma and fundamental theorem of arithmetic.', category: 'notes' },
          { id: 'm-10-8-1', title: 'Chapter 8: Trigonometry - Basics', chapter: 'Chapter 8: Trigonometry', type: 'pdf', url: '#', description: 'Trigonometric ratios and identities.', category: 'notes' },
          { id: 'm-10-ws', title: 'Trigorometry Practice Worksheet', chapter: 'Chapter 8: Trigonometry', type: 'pdf', url: '#', description: 'Important board patterns worksheet for trigonometric ratios.', category: 'worksheet' },
          { id: 'm-10-mp', title: 'Class X Secondary School Model Test Paper', chapter: 'Model Question Papers', type: 'pdf', url: '#', description: 'Full length mock assessment conforming to board frameworks.', category: 'model_paper' }
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
  }
];
