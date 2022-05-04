//
// let a = {q: 1};
// let b = {s: 0};
// console.log({...a, ...b})
// console.log(Math.abs(-100.20))
let a = 0.3;
let b = 9;
console.log("rs: ", (a * (b * 100)) / 100)

let arr = [
  { _id: { type: 0 }, cash: 100, chip: 100 },
  { _id: { type: 1 }, cash: 200, chip: 200 }
]

console.log("result: ", arr.reduce((all, item) => {
  return { cash: all.cash + item.cash, chip: all.chip + item.chip }
}));
