_.e([["value",()=>value]]);let value = 0

function add(x, y) {
  const value = x
  return value += y
}

function subtract(value, y) {
  return value -= y
}

function uid() {
  return _.u(value += 1)
}
