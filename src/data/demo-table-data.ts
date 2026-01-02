export type Person = {
  id: number
  firstName: string
  lastName: string
  age: number
  visits: number
  progress: number
  status: 'relationship' | 'complicated' | 'single'
  subRows?: Array<Person>
}

const names = [
  { first: 'John', last: 'Doe' },
  { first: 'Jane', last: 'Smith' },
  { first: 'Bob', last: 'Johnson' },
  { first: 'Alice', last: 'Williams' },
  { first: 'Charlie', last: 'Brown' },
  { first: 'Diana', last: 'Miller' },
  { first: 'Eve', last: 'Davis' },
  { first: 'Frank', last: 'Garcia' },
  { first: 'Grace', last: 'Martinez' },
  { first: 'Henry', last: 'Anderson' },
  { first: 'Ivy', last: 'Taylor' },
  { first: 'Jack', last: 'Thomas' },
  { first: 'Kate', last: 'Jackson' },
  { first: 'Leo', last: 'White' },
  { first: 'Mia', last: 'Harris' },
  { first: 'Noah', last: 'Martin' },
  { first: 'Olivia', last: 'Thompson' },
  { first: 'Paul', last: 'Robinson' },
  { first: 'Quinn', last: 'Clark' },
  { first: 'Rose', last: 'Rodriguez' },
]

const statuses: Array<Person['status']> = ['relationship', 'complicated', 'single']

const range = (len: number) => {
  const arr: Array<number> = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const newPerson = (num: number, depth: number): Person => {
  const nameIndex = num % names.length
  const name = names[nameIndex]
  return {
    id: num,
    firstName: name.first,
    lastName: name.last,
    age: 20 + (num * 3) % 40,
    visits: (num * 7) % 1000,
    progress: (num * 11) % 100,
    status: statuses[num % statuses.length],
    subRows: depth < 2 ? undefined : undefined,
  }
}

export function makeData(...lens: Array<number>) {
  const makeDataLevel = (depth = 0): Array<Person> => {
    const len = lens[depth]
    return range(len).map((index): Person => {
      return {
        ...newPerson(index, depth),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      }
    })
  }

  return makeDataLevel()
}
