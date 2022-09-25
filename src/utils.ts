export function getFreeList(arr: any[]) {
  //临时数组，用于存值
  let arrAdd = [...arr];
  for (let i = 1; i < arrAdd.length; i++) {
    const random = Math.floor(Math.random() * (i + 1));
    //交换两个数组
    [arrAdd[i], arrAdd[random]] = [arrAdd[random], arrAdd[i]];
  }
  return arrAdd;
}
