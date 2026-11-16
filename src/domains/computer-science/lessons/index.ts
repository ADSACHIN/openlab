import { defineLesson } from '@core/model';

export const bits = defineLesson({
  slug: 'bits-and-binary',
  domainId: 'computer-science',
  title: 'Bits, binary and two’s complement',
  summary: 'How eight on/off switches hold a number, a negative number, or a hex digit pair.',
  estimatedMinutes: 8,
  prerequisites: [],
  outcomes: [
    'convert between binary, decimal and hex',
    'explain place value in base 2',
    'read an 8-bit pattern as a two’s complement signed number',
  ],
  tags: ['binary', 'hex', 'twos-complement', 'number-representation'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **bit** is one switch: 0 or 1. Eight bits make a **byte**. Like decimal digits, each position has a place value, but the values double instead of multiplying by ten: 1, 2, 4, 8, 16, 32, 64, 128. Add the place values of the bits that are on and you have the number.',
    },
    {
      type: 'interactive',
      simulatorId: 'computer-science/binary',
      caption:
        'Click bits to flip them. Try the presets, then press Play to watch the register count and wrap from 255 to 0.',
    },
    { type: 'heading', level: 2, text: 'Worked example' },
    {
      type: 'paragraph',
      text: '`00001011` has bits 3, 1 and 0 on: 8 + 2 + 1 = **11**. The largest 8-bit value, `11111111`, is 255.',
    },
    { type: 'heading', level: 2, text: 'Hexadecimal' },
    {
      type: 'paragraph',
      text: 'Four bits have 16 possible values, exactly one hex digit (0–9, then A–F). So a byte is always two hex digits: `11111111` is `FF`, and 42 is `2A`. Programmers use hex because it is compact but still lines up with the bits.',
    },
    { type: 'heading', level: 2, text: 'Negative numbers: two’s complement' },
    {
      type: 'paragraph',
      text: 'To store negatives, the top bit is given a **negative** place value: −128 instead of +128. Now `11111111` reads as −128 + 127 = **−1**, `10000000` is −128, and `01111111` is still 127. The same eight bits mean different numbers depending on how the program chooses to read them.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Why this design?',
      text: 'With two’s complement, the same adder circuit handles signed and unsigned numbers. Adding 1 to `11111111` gives `00000000`: 255 + 1 wraps to 0 unsigned, and −1 + 1 = 0 signed. No special hardware for subtraction or negatives.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'computer-science/bits/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'What is `1011` in decimal?',
            choices: [
              { id: 'a', text: '11' },
              { id: 'b', text: '13' },
              { id: 'c', text: '1011' },
            ],
            answerId: 'a',
            explanation: '8 + 0 + 2 + 1 = 11.',
          },
          {
            id: 'q2',
            prompt: 'Read as 8-bit two’s complement, `11111111` is…',
            choices: [
              { id: 'a', text: '255' },
              { id: 'b', text: '−1' },
              { id: 'c', text: '−127' },
            ],
            answerId: 'b',
            explanation: '−128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = −1.',
          },
          {
            id: 'q3',
            prompt: '255 in hex is…',
            choices: [
              { id: 'a', text: 'FF' },
              { id: 'b', text: 'F0' },
              { id: 'c', text: '100' },
            ],
            answerId: 'a',
            explanation: 'Each group of four 1-bits is F.',
          },
        ],
      },
    },
  ],
});

export const gatesLesson = defineLesson({
  slug: 'logic-gates',
  domainId: 'computer-science',
  title: 'Logic gates',
  summary: 'AND, OR, NOT and friends: the decisions every circuit is built from.',
  estimatedMinutes: 7,
  prerequisites: ['computer-science/bits-and-binary'],
  outcomes: [
    'state the truth tables of AND, OR, NOT, NAND, NOR and XOR',
    'explain why NAND alone can build any other gate',
    'read a truth table',
  ],
  tags: ['logic', 'gates', 'boolean', 'hardware'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **logic gate** takes one or two bits and produces one bit. In hardware it is a handful of transistors; in your head it is a rule. A **truth table** lists the output for every input combination.',
    },
    {
      type: 'interactive',
      simulatorId: 'computer-science/logic-gates',
      caption:
        'Pick a gate, click the inputs, and watch the highlighted row of the truth table. Play walks through all four rows.',
    },
    {
      type: 'list',
      items: [
        '**AND**: 1 only if both inputs are 1',
        '**OR**: 1 if at least one input is 1',
        '**NOT**: flips its single input',
        '**NAND / NOR**: AND / OR followed by NOT',
        '**XOR**: 1 if the inputs differ — the heart of binary addition',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Universal gates',
      text: 'NAND is universal: NOT A = A NAND A; A AND B = NOT (A NAND B); A OR B = (NOT A) NAND (NOT B). Real chips are built mostly from NAND because it is the cheapest gate to make in CMOS.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'computer-science/gates/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'What is `1 NAND 1`?',
            choices: [
              { id: 'a', text: '0' },
              { id: 'b', text: '1' },
            ],
            answerId: 'a',
            explanation: '1 AND 1 = 1, then NOT gives 0.',
          },
          {
            id: 'q2',
            prompt: 'What is `1 XOR 1`?',
            choices: [
              { id: 'a', text: '0' },
              { id: 'b', text: '1' },
            ],
            answerId: 'a',
            explanation: 'XOR is 1 only when the inputs differ.',
          },
        ],
      },
    },
  ],
});

export const adders = defineLesson({
  slug: 'adders',
  domainId: 'computer-science',
  title: 'Building an adder from gates',
  summary: 'Half adders, full adders, and how a carry ripples across four bits.',
  estimatedMinutes: 9,
  prerequisites: ['computer-science/logic-gates'],
  outcomes: [
    'build a half adder from XOR and AND',
    'explain what a full adder adds',
    'predict the result and carry out of a 4-bit addition, including overflow',
  ],
  tags: ['adder', 'carry', 'overflow', 'hardware'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Adding two bits gives a sum bit and a carry bit. The sum is `A XOR B`; the carry is `A AND B`. That pair of gates is a **half adder**. A **full adder** also takes a carry in from the column to its right: sum = A XOR B XOR Cin, carry = 1 when at least two of the three inputs are 1.',
    },
    {
      type: 'interactive',
      simulatorId: 'computer-science/ripple-adder',
      caption:
        'Four full adders, bit 0 on the right. Step adds one column; watch the carry move left.',
    },
    {
      type: 'paragraph',
      text: 'Chain four full adders, each one’s carry out feeding the next one’s carry in, and you can add two 4-bit numbers. Try 5 + 3: the carry ripples through bits 0, 1 and 2, and the answer is `1000`, which is 8.',
    },
    { type: 'heading', level: 2, text: 'Overflow' },
    {
      type: 'paragraph',
      text: 'Four bits hold 0–15. 9 + 8 = 17 needs five bits, so the adder shows `0001` (1) with a carry out of 1. Software that ignores the carry out gets the wrong answer: that is **integer overflow**, the same wraparound you saw at 255 + 1 in the register.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Ripple is slow',
      text: 'Each column must wait for the carry from the previous one, so the delay grows with the number of bits. Real CPUs use carry-lookahead adders that compute carries in parallel.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'computer-science/adders/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'A half adder’s sum output is which gate?',
            choices: [
              { id: 'a', text: 'AND' },
              { id: 'b', text: 'OR' },
              { id: 'c', text: 'XOR' },
            ],
            answerId: 'c',
            explanation: '1 + 0 and 0 + 1 give 1; 1 + 1 gives 0 with a carry.',
          },
          {
            id: 'q2',
            prompt: 'A 4-bit adder computes 9 + 8. What 4-bit result does it show?',
            choices: [
              { id: 'a', text: '17' },
              { id: 'b', text: '1, with carry out 1' },
              { id: 'c', text: '15' },
            ],
            answerId: 'b',
            explanation: '17 = 10001 in binary; only the low four bits fit.',
          },
        ],
      },
    },
  ],
});

export const cpuLesson = defineLesson({
  slug: 'how-a-cpu-runs',
  domainId: 'computer-science',
  title: 'How a CPU runs a program',
  summary: 'Registers, memory and the fetch–decode–execute cycle on a tiny machine.',
  estimatedMinutes: 10,
  prerequisites: ['computer-science/adders'],
  outcomes: [
    'describe fetch, decode and execute',
    'explain the roles of PC, IR and the accumulator',
    'trace a loop in machine instructions',
  ],
  tags: ['cpu', 'fetch-decode-execute', 'registers', 'machine-code'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A CPU repeats one loop forever. **Fetch**: copy the instruction at the address in the program counter (PC) into the instruction register (IR), then add 1 to PC. **Decode**: work out what the instruction means. **Execute**: do it — load, add, store, jump. Program and data share the same memory.',
    },
    {
      type: 'interactive',
      simulatorId: 'computer-science/tiny-cpu',
      caption: 'Each Step is one phase. Watch PC move on fetch, before the instruction runs.',
    },
    { type: 'heading', level: 2, text: 'The program' },
    {
      type: 'code',
      language: 'asm',
      code: '0  LDA 10   ; ACC ← n\n1  OUT      ; print ACC\n2  SUB 11   ; ACC ← ACC − 1\n3  STA 10   ; n ← ACC\n4  JZ 6     ; if ACC = 0, go to 6\n5  JMP 0    ; otherwise loop\n6  HLT\n10 3        ; n\n11 1        ; the constant 1',
      caption: 'A countdown. With n = 3 it prints 3, 2, 1 in 18 instructions (54 steps).',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'The adder is in there',
      text: 'The SUB on line 2 is done by the same kind of adder you built: subtracting 1 in two’s complement is adding `11111111`. A real CPU’s arithmetic-logic unit (ALU) is a wider, faster version of that circuit.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'computer-science/cpu/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'The CPU fetches the instruction at address 4. What is PC during execute?',
            choices: [
              { id: 'a', text: '4' },
              { id: 'b', text: '5' },
            ],
            answerId: 'b',
            explanation:
              'Fetch increments PC, so a jump in execute overwrites an already-advanced PC.',
          },
          {
            id: 'q2',
            prompt: 'Which instruction makes this program a loop?',
            choices: [
              { id: 'a', text: 'OUT' },
              { id: 'b', text: 'JMP 0' },
              { id: 'c', text: 'STA 10' },
            ],
            answerId: 'b',
            explanation: 'JMP sends PC back to the start; JZ is the exit.',
          },
        ],
      },
    },
  ],
});

export const automata = defineLesson({
  slug: 'finite-automata',
  domainId: 'computer-science',
  title: 'Finite automata',
  summary: 'A machine with three states that can tell whether any binary number is divisible by 3.',
  estimatedMinutes: 8,
  prerequisites: ['computer-science/bits-and-binary'],
  outcomes: [
    'define states, transitions, start and accepting states',
    'trace a DFA on an input string',
    'explain why three states are enough for divisibility by 3',
  ],
  tags: ['automata', 'dfa', 'theory', 'regular-languages'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **deterministic finite automaton** (DFA) reads its input one symbol at a time. It is always in exactly one of a fixed set of **states**; each symbol moves it along a **transition** to the next state. When the input ends, it **accepts** if it is in an accepting state.',
    },
    {
      type: 'interactive',
      simulatorId: 'computer-science/dfa-mod3',
      caption:
        'Type a binary number and press Step. r0 (double ring) is the start and the only accepting state.',
    },
    { type: 'heading', level: 2, text: 'Why it works' },
    {
      type: 'paragraph',
      text: 'Reading one more bit doubles the number so far and adds the bit: v becomes 2v + b. Only the remainder mod 3 matters for the answer, and the remainder changes the same way: r becomes (2r + b) mod 3. So the machine only needs to remember the remainder — three states, however long the number is.',
    },
    {
      type: 'list',
      items: [
        '`110` (6): r0 → r1 → r0 → r0, accepted',
        '`111` (7): r0 → r1 → r0 → r1, rejected with remainder 1',
        '`1001` (9): r0 → r1 → r2 → r1 → r0, accepted',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Where you meet DFAs',
      text: 'Regular expressions compile to automata. So do lexers that split source code into tokens, network protocol state machines (TCP’s states are one) and the input handling of most user interfaces.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'computer-science/automata/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Does the machine accept `110`?',
            choices: [
              { id: 'a', text: 'Yes' },
              { id: 'b', text: 'No' },
            ],
            answerId: 'a',
            explanation: '110 is 6, which is divisible by 3.',
          },
          {
            id: 'q2',
            prompt: 'After reading `111`, which state is it in?',
            choices: [
              { id: 'a', text: 'r0' },
              { id: 'b', text: 'r1' },
              { id: 'c', text: 'r2' },
            ],
            answerId: 'b',
            explanation: '7 mod 3 = 1.',
          },
        ],
      },
    },
  ],
});
