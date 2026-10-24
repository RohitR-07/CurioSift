/**
 * Mock Quiz Generator — Module 7, Phase 1
 *
 * Provides deterministic sample quizzes so the UI can be built and tested
 * without a real Gemini API call. In Phase 2, replace `generateMockQuiz`
 * with a Gemini-powered generator that accepts the same config and returns
 * the same `GeneratedQuizSession` shape.
 *
 * NOTE: Questions are keyed by topic keyword and difficulty so the same
 * configuration always produces the same quiz, making scoring reliable.
 */

import type {
  QuizConfig,
  GeneratedQuizSession,
  MCQQuestion,
  TrueFalseQuestion,
  QuizQuestion,
} from '../types/quiz';

// ─── Sample Question Banks ────────────────────────────────────────────────────

const MCQ_BANK_EASY: MCQQuestion[] = [
  {
    id: 'mcq-e-1',
    type: 'mcq',
    question: 'What is the primary function of the mitochondria in a cell?',
    options: [
      { key: 'A', text: 'Protein synthesis' },
      { key: 'B', text: 'Energy production (ATP)' },
      { key: 'C', text: 'DNA replication' },
      { key: 'D', text: 'Waste removal' },
    ],
    correctKey: 'B',
    explanation: 'Mitochondria are often called the "powerhouse of the cell" because they produce ATP through cellular respiration.',
  },
  {
    id: 'mcq-e-2',
    type: 'mcq',
    question: 'Which planet is closest to the Sun?',
    options: [
      { key: 'A', text: 'Venus' },
      { key: 'B', text: 'Mars' },
      { key: 'C', text: 'Mercury' },
      { key: 'D', text: 'Earth' },
    ],
    correctKey: 'C',
    explanation: 'Mercury is the closest planet to the Sun, orbiting at an average distance of about 57.9 million kilometres.',
  },
  {
    id: 'mcq-e-3',
    type: 'mcq',
    question: 'What does HTML stand for?',
    options: [
      { key: 'A', text: 'HyperText Markup Language' },
      { key: 'B', text: 'High-Level Text Management Language' },
      { key: 'C', text: 'HyperText Machine Learning' },
      { key: 'D', text: 'Hyper Transfer Markup Language' },
    ],
    correctKey: 'A',
    explanation: 'HTML stands for HyperText Markup Language — the standard language for structuring web pages.',
  },
  {
    id: 'mcq-e-4',
    type: 'mcq',
    question: 'What is the chemical symbol for water?',
    options: [
      { key: 'A', text: 'WA' },
      { key: 'B', text: 'H2O' },
      { key: 'C', text: 'O2H' },
      { key: 'D', text: 'HO2' },
    ],
    correctKey: 'B',
    explanation: 'Water is made up of two hydrogen atoms bonded to one oxygen atom, giving it the chemical formula H₂O.',
  },
  {
    id: 'mcq-e-5',
    type: 'mcq',
    question: 'In which year did World War II end?',
    options: [
      { key: 'A', text: '1943' },
      { key: 'B', text: '1944' },
      { key: 'C', text: '1945' },
      { key: 'D', text: '1946' },
    ],
    correctKey: 'C',
    explanation: 'World War II ended in 1945: V-E Day (Victory in Europe) was on 8 May and V-J Day (Victory over Japan) was on 15 August.',
  },
  {
    id: 'mcq-e-6',
    type: 'mcq',
    question: 'What is the largest organ in the human body?',
    options: [
      { key: 'A', text: 'Liver' },
      { key: 'B', text: 'Brain' },
      { key: 'C', text: 'Lungs' },
      { key: 'D', text: 'Skin' },
    ],
    correctKey: 'D',
    explanation: 'The skin is the largest organ by surface area, covering the entire external surface of the body.',
  },
  {
    id: 'mcq-e-7',
    type: 'mcq',
    question: 'What programming paradigm does React primarily use?',
    options: [
      { key: 'A', text: 'Procedural programming' },
      { key: 'B', text: 'Functional and declarative programming' },
      { key: 'C', text: 'Object-oriented programming only' },
      { key: 'D', text: 'Logic programming' },
    ],
    correctKey: 'B',
    explanation: 'React embraces functional and declarative programming patterns — you describe what the UI should look like and React takes care of the DOM updates.',
  },
  {
    id: 'mcq-e-8',
    type: 'mcq',
    question: 'What is Newton\'s First Law of Motion?',
    options: [
      { key: 'A', text: 'Force equals mass times acceleration' },
      { key: 'B', text: 'Every action has an equal and opposite reaction' },
      { key: 'C', text: 'An object at rest stays at rest unless acted upon by an external force' },
      { key: 'D', text: 'Energy can neither be created nor destroyed' },
    ],
    correctKey: 'C',
    explanation: 'Newton\'s First Law (Law of Inertia) states that an object remains at rest or in uniform motion unless acted upon by a net external force.',
  },
  {
    id: 'mcq-e-9',
    type: 'mcq',
    question: 'Which data structure uses LIFO (Last In, First Out) ordering?',
    options: [
      { key: 'A', text: 'Queue' },
      { key: 'B', text: 'Stack' },
      { key: 'C', text: 'Linked List' },
      { key: 'D', text: 'Tree' },
    ],
    correctKey: 'B',
    explanation: 'A stack follows the Last In, First Out principle — the last element pushed is the first one popped.',
  },
  {
    id: 'mcq-e-10',
    type: 'mcq',
    question: 'What does CPU stand for?',
    options: [
      { key: 'A', text: 'Central Programming Unit' },
      { key: 'B', text: 'Computer Processing Unit' },
      { key: 'C', text: 'Central Processing Unit' },
      { key: 'D', text: 'Control Processing Unit' },
    ],
    correctKey: 'C',
    explanation: 'CPU stands for Central Processing Unit — it is the primary component that carries out the instructions of a computer program.',
  },
];

const MCQ_BANK_MEDIUM: MCQQuestion[] = [
  {
    id: 'mcq-m-1',
    type: 'mcq',
    question: 'In Big-O notation, what is the time complexity of binary search?',
    options: [
      { key: 'A', text: 'O(n)' },
      { key: 'B', text: 'O(n²)' },
      { key: 'C', text: 'O(log n)' },
      { key: 'D', text: 'O(1)' },
    ],
    correctKey: 'C',
    explanation: 'Binary search halves the search space with each comparison, resulting in O(log n) time complexity.',
  },
  {
    id: 'mcq-m-2',
    type: 'mcq',
    question: 'Which principle in Object-Oriented Programming allows a class to have multiple forms?',
    options: [
      { key: 'A', text: 'Encapsulation' },
      { key: 'B', text: 'Inheritance' },
      { key: 'C', text: 'Abstraction' },
      { key: 'D', text: 'Polymorphism' },
    ],
    correctKey: 'D',
    explanation: 'Polymorphism allows objects of different types to be treated as objects of a common base type. A single interface can represent different underlying forms.',
  },
  {
    id: 'mcq-m-3',
    type: 'mcq',
    question: 'What is the Krebs Cycle (Citric Acid Cycle) primarily responsible for?',
    options: [
      { key: 'A', text: 'DNA transcription' },
      { key: 'B', text: 'Generating NADH and FADH₂ for the electron transport chain' },
      { key: 'C', text: 'Photosynthesis in plants' },
      { key: 'D', text: 'Protein folding' },
    ],
    correctKey: 'B',
    explanation: 'The Krebs Cycle oxidises acetyl-CoA to CO₂ and produces high-energy electron carriers (NADH, FADH₂) and ATP.',
  },
  {
    id: 'mcq-m-4',
    type: 'mcq',
    question: 'What does the Central Limit Theorem state?',
    options: [
      { key: 'A', text: 'The mean of a sample is always equal to the population mean' },
      { key: 'B', text: 'All data must be normally distributed' },
      { key: 'C', text: 'The distribution of sample means approaches a normal distribution as sample size grows' },
      { key: 'D', text: 'Larger samples always produce smaller variance' },
    ],
    correctKey: 'C',
    explanation: 'The Central Limit Theorem states that regardless of the population distribution, the sampling distribution of the mean approaches normality as n increases.',
  },
  {
    id: 'mcq-m-5',
    type: 'mcq',
    question: 'Which HTTP method is idempotent and should be used for retrieving data?',
    options: [
      { key: 'A', text: 'POST' },
      { key: 'B', text: 'DELETE' },
      { key: 'C', text: 'GET' },
      { key: 'D', text: 'PATCH' },
    ],
    correctKey: 'C',
    explanation: 'GET is idempotent (calling it multiple times produces the same result) and is semantically used for retrieving resources without side effects.',
  },
  {
    id: 'mcq-m-6',
    type: 'mcq',
    question: 'In SQL, which clause is used to filter groups of rows after aggregation?',
    options: [
      { key: 'A', text: 'WHERE' },
      { key: 'B', text: 'HAVING' },
      { key: 'C', text: 'GROUP BY' },
      { key: 'D', text: 'FILTER' },
    ],
    correctKey: 'B',
    explanation: 'HAVING filters groups after GROUP BY aggregation, whereas WHERE filters individual rows before grouping.',
  },
  {
    id: 'mcq-m-7',
    type: 'mcq',
    question: 'What is the primary difference between TCP and UDP?',
    options: [
      { key: 'A', text: 'TCP is faster; UDP is slower' },
      { key: 'B', text: 'TCP is connection-oriented and reliable; UDP is connectionless and faster but unreliable' },
      { key: 'C', text: 'UDP guarantees packet delivery; TCP does not' },
      { key: 'D', text: 'TCP works on Layer 2; UDP works on Layer 4' },
    ],
    correctKey: 'B',
    explanation: 'TCP establishes a connection and guarantees ordered, reliable delivery. UDP is connectionless and faster but sacrifices reliability — ideal for streaming or gaming.',
  },
  {
    id: 'mcq-m-8',
    type: 'mcq',
    question: 'What does SOLID stand for in software engineering?',
    options: [
      { key: 'A', text: 'Single, Open, Liskov, Interface, Dependency principles' },
      { key: 'B', text: 'Scalable, Object-oriented, Layered, Integrated, Dynamic design' },
      { key: 'C', text: 'Structured, Open, Linked, Inherited, Distributed design' },
      { key: 'D', text: 'Simple, Optimized, Layered, Integrated, Dynamic design' },
    ],
    correctKey: 'A',
    explanation: 'SOLID is an acronym for five OOP design principles: Single responsibility, Open-closed, Liskov substitution, Interface segregation, and Dependency inversion.',
  },
  {
    id: 'mcq-m-9',
    type: 'mcq',
    question: 'In machine learning, what is overfitting?',
    options: [
      { key: 'A', text: 'The model performs well on training data but poorly on unseen data' },
      { key: 'B', text: 'The model has too few parameters to learn the data' },
      { key: 'C', text: 'The training data has too many features' },
      { key: 'D', text: 'The model takes too long to train' },
    ],
    correctKey: 'A',
    explanation: 'Overfitting occurs when a model learns noise and specific patterns in the training data so well that it fails to generalise to new, unseen examples.',
  },
  {
    id: 'mcq-m-10',
    type: 'mcq',
    question: 'What is the time complexity of inserting an element at the beginning of a singly linked list?',
    options: [
      { key: 'A', text: 'O(n)' },
      { key: 'B', text: 'O(log n)' },
      { key: 'C', text: 'O(n log n)' },
      { key: 'D', text: 'O(1)' },
    ],
    correctKey: 'D',
    explanation: 'Inserting at the head of a linked list is O(1) — you only need to update the head pointer and link to the previous head.',
  },
];

const MCQ_BANK_HARD: MCQQuestion[] = [
  {
    id: 'mcq-h-1',
    type: 'mcq',
    question: 'In the CAP Theorem, which two properties does a partition-tolerant distributed system typically sacrifice one of?',
    options: [
      { key: 'A', text: 'Consistency and Availability' },
      { key: 'B', text: 'Concurrency and Atomicity' },
      { key: 'C', text: 'Consistency and Durability' },
      { key: 'D', text: 'Availability and Scalability' },
    ],
    correctKey: 'A',
    explanation: 'The CAP Theorem states a distributed system can guarantee at most two of: Consistency, Availability, and Partition tolerance. Under a partition, you must choose between C and A.',
  },
  {
    id: 'mcq-h-2',
    type: 'mcq',
    question: 'What is the output of the following Python expression: `bool([] or {} or 0 or "hello")`?',
    options: [
      { key: 'A', text: 'False' },
      { key: 'B', text: 'True' },
      { key: 'C', text: '"hello"' },
      { key: 'D', text: 'SyntaxError' },
    ],
    correctKey: 'B',
    explanation: 'Python\'s `or` operator returns the first truthy value. `[]`, `{}`, and `0` are all falsy, so `"hello"` is returned. `bool("hello")` is `True`.',
  },
  {
    id: 'mcq-h-3',
    type: 'mcq',
    question: 'Which sorting algorithm has the best worst-case time complexity?',
    options: [
      { key: 'A', text: 'Quick Sort' },
      { key: 'B', text: 'Merge Sort' },
      { key: 'C', text: 'Heap Sort' },
      { key: 'D', text: 'Both B and C' },
    ],
    correctKey: 'D',
    explanation: 'Both Merge Sort and Heap Sort have O(n log n) worst-case time complexity, unlike Quick Sort which degrades to O(n²) in the worst case.',
  },
  {
    id: 'mcq-h-4',
    type: 'mcq',
    question: 'In quantum computing, what is quantum entanglement used for in quantum communication?',
    options: [
      { key: 'A', text: 'Faster classical encryption' },
      { key: 'B', text: 'Secure key distribution (quantum key distribution)' },
      { key: 'C', text: 'Speeding up sorting algorithms' },
      { key: 'D', text: 'Reducing memory usage' },
    ],
    correctKey: 'B',
    explanation: 'Entangled qubits enable Quantum Key Distribution (QKD) protocols like BB84, where any eavesdropping disturbs the quantum state and is detectable.',
  },
  {
    id: 'mcq-h-5',
    type: 'mcq',
    question: 'What is the key difference between a process and a thread in an operating system?',
    options: [
      { key: 'A', text: 'Processes share memory; threads do not' },
      { key: 'B', text: 'Threads share the same memory space within a process; processes have separate address spaces' },
      { key: 'C', text: 'Processes run faster than threads' },
      { key: 'D', text: 'Threads cannot communicate with each other' },
    ],
    correctKey: 'B',
    explanation: 'Threads within the same process share heap memory and file descriptors, making communication fast but requiring synchronisation. Processes have isolated address spaces.',
  },
  {
    id: 'mcq-h-6',
    type: 'mcq',
    question: 'Which consensus algorithm does Bitcoin use?',
    options: [
      { key: 'A', text: 'Proof of Stake (PoS)' },
      { key: 'B', text: 'Delegated Proof of Stake (DPoS)' },
      { key: 'C', text: 'Proof of Work (PoW)' },
      { key: 'D', text: 'Practical Byzantine Fault Tolerance (PBFT)' },
    ],
    correctKey: 'C',
    explanation: 'Bitcoin uses Proof of Work where miners must solve computationally expensive puzzles to add blocks, making the chain tamper-resistant through energy cost.',
  },
  {
    id: 'mcq-h-7',
    type: 'mcq',
    question: 'In the context of React, what problem do concurrent features like `startTransition` solve?',
    options: [
      { key: 'A', text: 'They allow React to skip rendering expensive components entirely' },
      { key: 'B', text: 'They allow React to interrupt low-priority renders for high-priority user interactions' },
      { key: 'C', text: 'They eliminate the need for memoization with useMemo' },
      { key: 'D', text: 'They enable server-side rendering on the client' },
    ],
    correctKey: 'B',
    explanation: '`startTransition` marks state updates as non-urgent so React can interrupt them to respond to higher-priority interactions like typing, preventing UI jank.',
  },
  {
    id: 'mcq-h-8',
    type: 'mcq',
    question: 'What is Amdahl\'s Law used to calculate in parallel computing?',
    options: [
      { key: 'A', text: 'The maximum speedup achievable by parallelising a program' },
      { key: 'B', text: 'The total memory required for a parallel algorithm' },
      { key: 'C', text: 'The optimal number of CPU cores for a task' },
      { key: 'D', text: 'The energy cost of parallel computations' },
    ],
    correctKey: 'A',
    explanation: 'Amdahl\'s Law states the maximum speedup is limited by the sequential portion of a task: Speedup ≤ 1 / (s + (1-s)/p) where s is the serial fraction.',
  },
  {
    id: 'mcq-h-9',
    type: 'mcq',
    question: 'In graph theory, which algorithm finds the minimum spanning tree of a weighted graph?',
    options: [
      { key: 'A', text: 'Dijkstra\'s algorithm' },
      { key: 'B', text: 'Bellman-Ford algorithm' },
      { key: 'C', text: 'Kruskal\'s algorithm' },
      { key: 'D', text: 'Floyd-Warshall algorithm' },
    ],
    correctKey: 'C',
    explanation: 'Kruskal\'s algorithm finds the MST by greedily selecting the lowest-weight edges that don\'t form a cycle. Prim\'s algorithm is another valid MST algorithm.',
  },
  {
    id: 'mcq-h-10',
    type: 'mcq',
    question: 'What is the difference between a mutex and a semaphore?',
    options: [
      { key: 'A', text: 'A mutex allows multiple threads; a semaphore allows only one' },
      { key: 'B', text: 'A mutex has an owner (only the locking thread can unlock); a semaphore can be signalled by any thread' },
      { key: 'C', text: 'They are identical concepts with different names' },
      { key: 'D', text: 'Semaphores are only for processes; mutexes are only for threads' },
    ],
    correctKey: 'B',
    explanation: 'A mutex is owned by the thread that locks it — only that thread can release it. A semaphore is a signalling mechanism and can be incremented by any thread/process.',
  },
];

const TF_BANK_EASY: TrueFalseQuestion[] = [
  {
    id: 'tf-e-1',
    type: 'true-false',
    question: 'JavaScript is a statically typed programming language.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'JavaScript is dynamically typed — variable types are determined at runtime, not at compile time. TypeScript adds optional static typing on top of JavaScript.',
  },
  {
    id: 'tf-e-2',
    type: 'true-false',
    question: 'The Sun is a star.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'The Sun is indeed a star — a G-type main-sequence star (G2V) at the centre of our solar system.',
  },
  {
    id: 'tf-e-3',
    type: 'true-false',
    question: 'RAM (Random Access Memory) is a type of non-volatile storage.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'RAM is volatile memory — its contents are lost when the computer loses power. SSDs and HDDs are examples of non-volatile storage.',
  },
  {
    id: 'tf-e-4',
    type: 'true-false',
    question: 'Photosynthesis converts light energy into chemical energy in plants.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'Photosynthesis uses sunlight to convert carbon dioxide and water into glucose and oxygen, storing energy in chemical bonds.',
  },
  {
    id: 'tf-e-5',
    type: 'true-false',
    question: 'The Internet and the World Wide Web are the same thing.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'The Internet is the global network infrastructure. The World Wide Web is a service built on top of the Internet that uses HTTP to share documents and resources.',
  },
  {
    id: 'tf-e-6',
    type: 'true-false',
    question: 'An array in most programming languages starts at index 0.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'Zero-based indexing is standard in most programming languages including C, Java, Python, and JavaScript.',
  },
  {
    id: 'tf-e-7',
    type: 'true-false',
    question: 'DNA stands for Deoxyribonucleic Acid.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'DNA (Deoxyribonucleic Acid) is the molecule that carries the genetic instructions for the development and function of all living organisms.',
  },
  {
    id: 'tf-e-8',
    type: 'true-false',
    question: 'Python requires explicit semicolons at the end of each statement.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'Python uses indentation and newlines to delimit code blocks and statements. Semicolons are optional and rarely used.',
  },
  {
    id: 'tf-e-9',
    type: 'true-false',
    question: 'Light travels faster than sound.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'Light travels at approximately 299,792 km/s in a vacuum, vastly faster than sound which travels at about 343 m/s in air.',
  },
  {
    id: 'tf-e-10',
    type: 'true-false',
    question: 'Git and GitHub are the same product.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'Git is a distributed version control system. GitHub is a cloud-based hosting service for Git repositories, built on top of Git.',
  },
];

const TF_BANK_MEDIUM: TrueFalseQuestion[] = [
  {
    id: 'tf-m-1',
    type: 'true-false',
    question: 'In React, calling `useState` setter function always triggers a re-render, even if the new value is identical to the old value.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'React uses Object.is comparison to bail out of re-renders. If you set state to the same value, React may skip the re-render (though child effects may still run once).',
  },
  {
    id: 'tf-m-2',
    type: 'true-false',
    question: 'HTTPS encrypts data using symmetric encryption only.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'HTTPS (TLS) uses asymmetric encryption during the handshake to exchange keys, then switches to symmetric encryption for the actual data transfer.',
  },
  {
    id: 'tf-m-3',
    type: 'true-false',
    question: 'A SQL JOIN without a WHERE clause can produce a Cartesian product if not constrained.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'A CROSS JOIN (or implicit JOIN without ON condition) produces a Cartesian product — every row from the first table paired with every row from the second.',
  },
  {
    id: 'tf-m-4',
    type: 'true-false',
    question: 'In Python, tuples are mutable data structures.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'Tuples are immutable in Python — once created their elements cannot be changed, added, or removed, unlike lists.',
  },
  {
    id: 'tf-m-5',
    type: 'true-false',
    question: 'The OSI model has 7 layers.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'The OSI (Open Systems Interconnection) model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.',
  },
  {
    id: 'tf-m-6',
    type: 'true-false',
    question: 'Recursion always uses less memory than an iterative solution.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'Recursion uses additional stack frames for each call, which can use more memory than an iterative solution, and deep recursion can cause stack overflow.',
  },
  {
    id: 'tf-m-7',
    type: 'true-false',
    question: 'REST APIs are stateless by design.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'Statelessness is a core REST constraint — each request from client to server must contain all information needed to understand it; the server stores no session state between requests.',
  },
  {
    id: 'tf-m-8',
    type: 'true-false',
    question: 'A hash function always produces output of variable length.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'Cryptographic hash functions always produce fixed-length output regardless of input size — SHA-256 always outputs 256 bits.',
  },
  {
    id: 'tf-m-9',
    type: 'true-false',
    question: 'In CSS, the `z-index` property only works on elements with a non-static position.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: '`z-index` has no effect on elements with `position: static` (the default). It requires `position: relative`, `absolute`, `fixed`, or `sticky`.',
  },
  {
    id: 'tf-m-10',
    type: 'true-false',
    question: 'Gradient descent always converges to the global minimum for any cost function.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'Gradient descent converges to the global minimum only for convex functions. For non-convex functions (like most neural networks), it may get stuck in local minima.',
  },
];

const TF_BANK_HARD: TrueFalseQuestion[] = [
  {
    id: 'tf-h-1',
    type: 'true-false',
    question: 'In the context of the Byzantine Generals Problem, a system with f faulty nodes requires at least 3f+1 total nodes to reach consensus.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'To tolerate f Byzantine faults, you need at least 3f+1 nodes — this ensures the loyal generals always outnumber the traitors even in the worst case.',
  },
  {
    id: 'tf-h-2',
    type: 'true-false',
    question: 'In P vs NP, if P = NP were proven, then every problem whose solution can be verified in polynomial time could also be solved in polynomial time.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'That is exactly what P = NP would mean: NP (verifiable in polynomial time) would equal P (solvable in polynomial time), collapsing a fundamental distinction in computation.',
  },
  {
    id: 'tf-h-3',
    type: 'true-false',
    question: 'Rust\'s ownership system prevents all forms of undefined behaviour at runtime.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'Rust prevents many categories of undefined behaviour (use-after-free, data races) at compile time, but `unsafe` blocks can still introduce UB, and logical errors remain possible.',
  },
  {
    id: 'tf-h-4',
    type: 'true-false',
    question: 'In category theory applied to functional programming, a Monad is also an Applicative Functor.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'Every Monad is an Applicative Functor, which is itself a Functor. Monads add `bind` (>>=) to the Applicative interface, forming a hierarchy.',
  },
  {
    id: 'tf-h-5',
    type: 'true-false',
    question: 'In a B-tree of order m, every node (except the root) must have at least ⌈m/2⌉ - 1 keys.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'This minimum fill factor ensures B-trees stay balanced and storage-efficient. The root is exempt so it can have as few as 1 key.',
  },
  {
    id: 'tf-h-6',
    type: 'true-false',
    question: 'WebAssembly can only run code written in C and C++.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'WebAssembly is a binary instruction format — a compilation target. Rust, Go, Kotlin, AssemblyScript, and many other languages can compile to WASM.',
  },
  {
    id: 'tf-h-7',
    type: 'true-false',
    question: 'In Git, rebasing rewrites commit history by creating new commits with different SHAs.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'Rebase replays commits on top of another base, generating new commit objects with different SHA-1 hashes, effectively rewriting the branch\'s history.',
  },
  {
    id: 'tf-h-8',
    type: 'true-false',
    question: 'The Halting Problem is decidable for restricted programming languages with bounded loops.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'A',
    explanation: 'For Turing-incomplete languages (e.g., languages that only allow bounded loops), all programs terminate and the halting problem becomes decidable. Turing-complete languages make it undecidable.',
  },
  {
    id: 'tf-h-9',
    type: 'true-false',
    question: 'In distributed systems, eventual consistency guarantees that reads will always return the latest write.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'Eventual consistency only guarantees that, given no new updates, all replicas will converge to the same value eventually — stale reads are possible in the interim.',
  },
  {
    id: 'tf-h-10',
    type: 'true-false',
    question: 'SHA-256 is a symmetric encryption algorithm.',
    options: [{ key: 'A', text: 'True' }, { key: 'B', text: 'False' }],
    correctKey: 'B',
    explanation: 'SHA-256 is a cryptographic hash function, not an encryption algorithm. It is one-way (non-reversible), while encryption is two-way (reversible with a key).',
  },
];

// ─── Bank Selection ───────────────────────────────────────────────────────────

function getMCQBank(difficulty: QuizConfig['difficulty']): MCQQuestion[] {
  switch (difficulty) {
    case 'easy': return MCQ_BANK_EASY;
    case 'hard': return MCQ_BANK_HARD;
    default:     return MCQ_BANK_MEDIUM;
  }
}

function getTFBank(difficulty: QuizConfig['difficulty']): TrueFalseQuestion[] {
  switch (difficulty) {
    case 'easy': return TF_BANK_EASY;
    case 'hard': return TF_BANK_HARD;
    default:     return TF_BANK_MEDIUM;
  }
}

function pick<T>(arr: T[], count: number): T[] {
  return arr.slice(0, Math.min(count, arr.length));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Simulates async quiz generation with a realistic delay.
 * Replace this function body in Phase 2 with a real Gemini API call.
 * The function signature and return type must not change.
 */
export async function generateMockQuiz(
  config: QuizConfig,
): Promise<GeneratedQuizSession> {
  // Simulate network/AI latency (1.5–2.5 s)
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  const { questionCount, questionType, difficulty } = config;
  const mcqBank = getMCQBank(difficulty);
  const tfBank  = getTFBank(difficulty);

  let questions: QuizQuestion[];

  if (questionType === 'mcq') {
    questions = pick(mcqBank, questionCount);
  } else if (questionType === 'true-false') {
    questions = pick(tfBank, questionCount);
  } else {
    // mixed: roughly half MCQ, half T/F
    const half = Math.ceil(questionCount / 2);
    questions = [
      ...pick(mcqBank, half),
      ...pick(tfBank, questionCount - half),
    ];
  }

  const sessionId =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    sessionId,
    config,
    questions,
    source: 'mock',
    generatedAt: Date.now(),
  };
}
