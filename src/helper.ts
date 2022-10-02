import * as PIXI from "pixi.js";
import { Card, Model } from "./type";
import gsap from "gsap";
import { getFreeList } from "./utils";

export const createMask = (app: PIXI.Application, model: Model) => {
  let rectangle = new PIXI.Graphics();
  rectangle.beginFill(0x000000, 0.3);
  rectangle.drawRect(0, 0, window.innerWidth, window.innerHeight);
  rectangle.endFill();
  rectangle.zIndex = 2000;
  rectangle.visible = false;
  app.stage.addChild(rectangle);
  model.mask = rectangle;
  return rectangle;
};

const createText = (app: PIXI.Application, text: string) => {
  const msg = new PIXI.Text(text, {
    fontSize: window.innerWidth / 15,
    fill: "white",
    stroke: "#ff3300",
  });
  return msg;
};

export const createMenuModal = (app: PIXI.Application, model: Model) => {
  const container = new PIXI.Container();
  let roundBox = new PIXI.Graphics();
  roundBox.lineStyle(4, 0xb98340, 1);
  roundBox.beginFill(0xff9933);
  const width = (window.innerWidth * 2) / 3;
  const height = (window.innerWidth * 11) / 15;
  roundBox.drawRoundedRect(0, 0, width, height, 10);
  roundBox.endFill();
  roundBox.x = (window.innerWidth - width) / 2;
  roundBox.y = 0;

  const msgArr = [
    "🍴菜单🍴：",
    "1.荔枝 ￥18",
    "2.酥鳝 ￥53",
    "3.圣金饼 ￥28",
    "4.蒸虾头 ￥88",
    "5.香精煎鱼 ￥138",
    "6.人参公🐔 ￥666",
  ];
  const arr = msgArr.map((item, index) => {
    const msg = createText(app, item);
    msg.x = roundBox.x + 10;
    msg.y = index * msg.height + 10;
    return msg;
  });

  const btnText = createText(app, "关闭");
  btnText.x = (window.innerWidth - btnText.width) / 2;
  btnText.y = roundBox.y + roundBox.height - btnText.height - 20;
  btnText.interactive = true;
  btnText.on("pointertap", () => {
    if (model.mask) {
      model.mask.visible = false;
      model.isOnMask = false;
      const width = container.width;
      const height = container.height;
      const y = container.y;
      gsap.to(container, {
        x: window.innerWidth / 2,
        y: y + height / 2,
        width: 0,
        height: 0,
        duration: 0.2,
      });
      setTimeout(() => {
        container.visible = false;
        container.width = width;
        container.height = height;
        container.x = 0;
        container.y = y;
      }, 300);
    }
  });

  container.addChild(roundBox, ...arr, btnText);
  container.y =
    (window.innerHeight - container.height) / 2 - container.height / 2;
  container.zIndex = 2001;
  container.visible = false;

  app.stage.addChild(container);
  model.menu = container;
  return container;
};

export const drawCardBody = (fillColor: any, width: number, height: number) => {
  const roundBox = new PIXI.Graphics();
  roundBox.name = "body";
  roundBox.lineStyle(2, 0x626f29, 1);
  roundBox.beginFill(fillColor);
  roundBox.drawRoundedRect(0, 0, width, height, 10);
  roundBox.endFill();
  return roundBox;
};

const wash = (
  app: PIXI.Application,
  model: Model,
  {
    main,
    leftBottom,
    rightBottom,
  }: { main: any[]; leftBottom: any[]; rightBottom: any[] }
) => {
  [...main, ...leftBottom, ...rightBottom].forEach((item) => {
    gsap.to(item, {
      x: (window.innerWidth - model.cardWidth) / 2,
      y: 4 * model.cardHeight,
    });
  });
  setTimeout(() => {
    const refreshCard = (card: any) => {
      card.interactive = !card.gameInfo.upList.length;
      const body = card.getChildByName("body");
      card.removeChild(body);
      card.addChildAt(
        drawCardBody(
          card.gameInfo.upList.length ? 0xcdd2b6 : 0xf5ffca,
          model.cardWidth,
          model.cardHeight
        ),
        0
      );
    };

    leftBottom.forEach((item, index) => {
      item.gameInfo.upList =
        index < leftBottom.length - 1 ? [leftBottom[index + 1].name] : [];
      item.gameInfo.downList = index !== 0 ? [leftBottom[index - 1].name] : [];
      item.zIndex = index;
      refreshCard(item);
      gsap.to(item, {
        x: 0.5 * model.cardWidth + index * model.cardWidth * 0.1,
        y: 6.75 * model.cardHeight,
      });
    });
    rightBottom.forEach((item, index) => {
      item.gameInfo.upList =
        index < rightBottom.length - 1 ? [rightBottom[index + 1].name] : [];
      item.gameInfo.downList = index !== 0 ? [rightBottom[index - 1].name] : [];
      item.zIndex = index;
      refreshCard(item);
      gsap.to(item, {
        x:
          window.innerWidth -
          1.5 * model.cardWidth -
          index * model.cardWidth * 0.1,
        y: 6.75 * model.cardHeight,
      });
    });

    let i = 0;
    const grid: any[][][] = [];
    while (main.length) {
      const size = i % 2 === 0 ? 5 : 6;
      const arr = main.splice(0, size * size);
      if (arr.length === 15) {
        arr.splice(5, 0, ...new Array(5).fill(0));
        arr.splice(15, 0, ...new Array(5).fill(0));
      }
      const subGrid = arr.reduce((acc: string[][], cur, index) => {
        const vector = Math.floor(index / size);
        if (acc[vector]) {
          acc[vector].push(cur);
        } else {
          acc[vector] = [cur];
        }
        return acc;
      }, []);
      i++;
      grid.push(subGrid);
    }
    grid.forEach((item, index) => {
      const size = index % 2 === 0 ? 5 : 6;
      item.forEach((item1, index1) => {
        item1.forEach((item2, index2) => {
          if (!item2) return;
          const getUpList = () => {
            if (index === grid.length) return [];
            if (index % 2 === 0) {
              return [
                grid[index + 1]?.[index1]?.[index2]?.name,
                grid[index + 1]?.[index1 + 1]?.[index2]?.name,
                grid[index + 1]?.[index1]?.[index2 + 1]?.name,
                grid[index + 1]?.[index1 + 1]?.[index2 + 1]?.name,
              ].filter(Boolean);
            }
            return [
              grid[index + 1]?.[index1]?.[index2]?.name,
              grid[index + 1]?.[index1 - 1]?.[index2]?.name,
              grid[index + 1]?.[index1]?.[index2 - 1]?.name,
              grid[index + 1]?.[index1 - 1]?.[index2 - 1]?.name,
            ].filter(Boolean);
          };
          const getDownList = () => {
            if (index === 0) return [];
            if (index % 2 === 0) {
              return [
                grid[index - 1]?.[index1]?.[index2]?.name,
                grid[index - 1]?.[index1 + 1]?.[index2]?.name,
                grid[index - 1]?.[index1]?.[index2 + 1]?.name,
                grid[index - 1]?.[index1 + 1]?.[index2 + 1]?.name,
              ].filter(Boolean);
            }
            return [
              grid[index - 1]?.[index1]?.[index2]?.name,
              grid[index - 1]?.[index1 - 1]?.[index2]?.name,
              grid[index - 1]?.[index1]?.[index2 - 1]?.name,
              grid[index - 1]?.[index1 - 1]?.[index2 - 1]?.name,
            ].filter(Boolean);
          };
          item2.gameInfo.upList = getUpList();
          item2.gameInfo.downList = getDownList();
          item2.zIndex = index;
          refreshCard(item2);
          gsap.to(item2, {
            x:
              (window.innerWidth - size * model.cardWidth) / 2 +
              index2 * model.cardWidth,
            y:
              model.cardHeight * (0.5 + index1) +
              (index % 2 === 0 ? 0.5 * model.cardHeight : 0),
          });
        });
      });
    });
  }, 1000);
};

export const drawControlButton = (
  app: PIXI.Application,
  model: Model,
  baseUrl: string
) => {
  const loader = new PIXI.Loader();
  loader
    .add(baseUrl + "/刷新.png")
    .add(baseUrl + "/转换开关.png")
    .add(baseUrl + "/菜单.png")
    .load(() => {
      const width = window.innerWidth / 5;
      const height = (width * 12) / 15;
      const createBG = () => {
        const roundBox = new PIXI.Graphics();
        roundBox.lineStyle(2, 0x294420, 1);
        roundBox.beginFill(0x24a4ff);
        roundBox.drawRoundedRect(0, 0, width, height, 10);
        roundBox.endFill();
        return roundBox;
      };

      const bg3 = createBG();
      const menu = new PIXI.Sprite(
        loader.resources[baseUrl + "/菜单.png"].texture
      );
      menu.width = 50;
      menu.height = 50;
      menu.x = (width - 50) / 2;
      menu.y = (height - 50) / 2;
      const container3 = new PIXI.Container();
      container3.addChild(bg3, menu);
      container3.x = (window.innerWidth - 3 * width) / 4;
      container3.y = window.innerHeight - height - 10;
      container3.interactive = true;
      container3.name = "menuBtn";
      container3.on("pointertap", () => {
        if (model.isOnMask) return;
        if (model.mask && model.menu) {
          const menuWidth = model.menu.width;
          const menuHeight = model.menu.height;
          model.menu.x = window.innerWidth / 2;
          model.menu.y = model.menu.y + menuHeight / 2;
          model.menu.width = 0;
          model.menu.height = 0;
          model.isOnMask = true;
          model.mask.visible = true;
          model.menu.visible = true;
          gsap.to(model.menu, {
            x: 0,
            y: (window.innerHeight - menuHeight) / 2 - menuHeight / 2,
            width: menuWidth,
            height: menuHeight,
            duration: 0.2,
          });
        }
      });

      const bg1 = createBG();
      const refresh = new PIXI.Sprite(
        loader.resources[baseUrl + "/刷新.png"].texture
      );
      refresh.width = 50;
      refresh.height = 50;
      refresh.x = (width - 50) / 2;
      refresh.y = (height - 50) / 2;
      const container1 = new PIXI.Container();
      container1.addChild(bg1, refresh);
      container1.x = container3.x * 2 + width;
      container1.y = window.innerHeight - height - 10;
      container1.interactive = true;
      container1.on("pointertap", () => {
        if (model.isOnMask) return;
        const main: any[] = [];
        const leftBottom: any[] = [];
        const rightBottom: any[] = [];
        const collectedArr = model.collectorArray.map((item) => item.name);
        app.stage.children.forEach((item) => {
          if (collectedArr.includes(item.name)) return;
          if (item.name?.includes("main")) {
            main.push(item);
          } else if (item.name?.includes("rightBottom")) {
            rightBottom.push(item);
          } else if (item.name?.includes("leftBottom")) {
            leftBottom.push(item);
          }
        });
        wash(app, model, {
          main: getFreeList([...main, ...model.bottomArray]),
          leftBottom: getFreeList(leftBottom),
          rightBottom: getFreeList(rightBottom),
        });
        model.bottomArray = [];
      });

      const bg2 = createBG();
      const distill = new PIXI.Sprite(
        loader.resources[baseUrl + "/转换开关.png"].texture
      );
      distill.width = 50;
      distill.height = 50;
      distill.x = (width - 50) / 2;
      distill.y = (height - 50) / 2;
      const container2 = new PIXI.Container();
      container2.addChild(bg2, distill);
      container2.x = container3.x * 3 + width * 2;
      container2.y = window.innerHeight - height - 10;
      container2.interactive = true;
      container2.on("pointertap", () => {
        if (model.isOnMask) return;
        getFreeList(model.collectorArray).forEach((item, index) => {
          item.gameInfo!.isCollected = false;
          item.zIndex = 100;
          model.bottomArray.push(item);
          gsap.to(item, {
            x:
              (window.innerWidth -
                model.collectorArray.length * model.cardWidth) /
                2 +
              index * model.cardWidth,
            y: model.collectorY - model.cardHeight - 10,
          });
        });
        model.collectorArray = [];
      });

      app.stage.addChild(container3, container1, container2);
    });
};
