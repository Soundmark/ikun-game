import React, { useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { Card, Model } from "./type";
import gsap from "gsap";
import { getFreeList } from "./utils";
import {
  createMask,
  createMenuModal,
  drawCardBody,
  drawControlButton,
} from "./helper";
import { sound } from "@pixi/sound";

const model: Model = {
  collectorX: 0,
  collectorY: 0,
  collectorArray: [],
  cardWidth: window.innerWidth / 8,
  cardHeight: (window.innerWidth * 5) / 32,
  isOnMask: true,
  bottomArray: [],
};

const foots = ["荔枝", "酥鳝", "蒸虾头", "圣金饼", "香精煎鱼", "人参公鸡"];

function App() {
  const [showStartModal, setShowStartModal] = useState(true);
  const [showFailModal, setShowFailModal] = useState(false);

  const drawCollectRect = (app: PIXI.Application) => {
    const roundBox = new PIXI.Graphics();
    roundBox.lineStyle(4, 0xb98340, 1);
    roundBox.beginFill(0x90581a);
    const width = (window.innerWidth * 7) / 8;
    const height = (window.innerWidth * 5) / 32 + 4;
    roundBox.drawRoundedRect(0, 0, width + 4, height, 5);
    model.collectorX = (window.innerWidth - width) / 2;
    model.collectorY =
      window.innerHeight - height - 20 - (window.innerWidth * 11) / (4 * 15); // 减去控制按钮的高度并留一定间隔
    roundBox.x = model.collectorX;
    roundBox.y = model.collectorY;
    roundBox.endFill();
    app.stage.addChild(roundBox);
  };

  const collaspItems = (app: PIXI.Application): boolean => {
    const infoObj = model.collectorArray
      .map((item) => item.gameInfo?.text || "any")
      .reduce((acc: Record<string, number[]>, cur, index) => {
        if (!acc[cur]) {
          acc[cur] = [index];
        } else {
          acc[cur].push(index);
        }
        return acc;
      }, {});
    const checkAndDealCollasp = (arr: string[]) => {
      if (arr.every((item) => infoObj[item])) {
        const indexArr: any[] = [];
        arr.forEach((item) => {
          app.stage.removeChild(model.collectorArray[infoObj[item][0]]);
          indexArr.push(infoObj[item][0]);
        });
        model.collectorArray = model.collectorArray.filter(
          (item, index) => !indexArr.includes(index)
        );
        return true;
      }
      return false;
    };
    for (let i = 0; i < foots.length; i++) {
      if (checkAndDealCollasp(foots[i].split(""))) {
        return true;
      }
    }
    return false;
  };

  const createCard = (
    app: PIXI.Application,
    text: string,
    opts: {
      x: number;
      y: number;
      upList: string[];
      downList: string[];
      name: string;
    }
  ) => {
    const { x, y, upList, downList, name } = opts;
    const width = model.cardWidth;
    const height = model.cardHeight;
    const roundBox = drawCardBody(
      upList.length ? 0xcdd2b6 : 0xf5ffca,
      width,
      height
    );

    const textStyle = new PIXI.TextStyle({
      fill: 0x6da013,
      fontSize: 30,
    });
    const message = new PIXI.Text(text, textStyle);
    message.name = "text";
    message.position.set(9, 13);
    const card: Card = new PIXI.Container();
    card.name = name;
    card.addChild(roundBox, message);
    card.position.set(x, y);
    card.gameInfo = { text, upList, downList };
    card.interactive = !upList.length;
    card.on("pointertap", ({ target }: { target: Card }) => {
      if (target.gameInfo?.isCollected || model.isOnMask) return;
      if (target.gameInfo?.text === "鸡") {
        sound.play("zhiyin");
      }

      target.zIndex = 1000;
      gsap.to(target, {
        x: model.collectorX + 2 + model.collectorArray.length * width,
        y: model.collectorY + 2,
      });
      target.gameInfo!.isCollected = true;
      target.gameInfo?.downList.forEach((item) => {
        const downCard: Card = app.stage.getChildByName(item);
        downCard.gameInfo!.upList = downCard.gameInfo!.upList.filter(
          (ele) => ele !== target.name
        );
        if (downCard.gameInfo?.upList.length) return;
        downCard.interactive = true;
        const body = downCard.getChildByName("body");
        downCard.removeChild(body);
        downCard.addChildAt(drawCardBody(0xf5ffca, width, height), 0);
      });
      model.collectorArray.push(target);
      setTimeout(() => {
        if (collaspItems(app)) {
          model.collectorArray.forEach((item, index) => {
            gsap.to(item, {
              x: model.collectorX + 2 + index * width,
              y: model.collectorY + 2,
            });
          });
        } else if (model.collectorArray.length === 7) {
          sound.play("niganma");
          setShowFailModal(true);
          model.mask!.visible = true;
          model.isOnMask = true;
        }
      }, 600);
    });
    app.stage.addChild(card);
  };

  useEffect(() => {
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    app.renderer.backgroundColor = 0xfdee02;
    document.querySelector(".App")?.appendChild(app.view);
    app.stage.sortableChildren = true;
    model.app = app;
    sound.add("zhiyin", "/只因.mp3");
    sound.add("niganma", "/你干嘛.mp3");

    drawControlButton(app, model);
    createMask(app, model);
    createMenuModal(app, model);
    drawCollectRect(app);
    model.mask!.visible = true;
    const allItemArr = getFreeList(
      new Array(20).fill(foots).reduce((acc: string[], cur: string[]) => {
        cur.forEach((item) => {
          acc = acc.concat(item.split(""));
        });
        return acc;
      }, [])
    );
    const leftBottom = allItemArr.slice(0, 20);
    const rightBottom = allItemArr.slice(20, 40);
    const main = allItemArr.slice(40);
    leftBottom.forEach((item, index) => {
      createCard(app, item, {
        x: 0.5 * model.cardWidth + index * model.cardWidth * 0.1,
        y: 6.75 * model.cardHeight,
        name: `leftBottom${index}`,
        upList: index < leftBottom.length - 1 ? [`leftBottom${index + 1}`] : [],
        downList: index !== 0 ? [`leftBottom${index - 1}`] : [],
      });
    });
    rightBottom.forEach((item, index) => {
      createCard(app, item, {
        x:
          window.innerWidth -
          1.5 * model.cardWidth -
          index * model.cardWidth * 0.1,
        y: 6.75 * model.cardHeight,
        name: `rightBottom${index}`,
        upList:
          index < rightBottom.length - 1 ? [`rightBottom${index + 1}`] : [],
        downList: index !== 0 ? [`rightBottom${index - 1}`] : [],
      });
    });
    let i = 0;
    const grid: string[][][] = [];
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
                `main_${index + 1}_${index1}_${index2}`,
                `main_${index + 1}_${index1 + 1}_${index2}`,
                `main_${index + 1}_${index1}_${index2 + 1}`,
                `main_${index + 1}_${index1 + 1}_${index2 + 1}`,
              ].filter((e) => {
                const eSplit = e.split("_") as [string, number, number, number];
                return grid[eSplit[1]]?.[eSplit[2]]?.[eSplit[3]];
              });
            }
            return [
              `main_${index + 1}_${index1}_${index2}`,
              `main_${index + 1}_${index1 - 1}_${index2}`,
              `main_${index + 1}_${index1}_${index2 - 1}`,
              `main_${index + 1}_${index1 - 1}_${index2 - 1}`,
            ].filter((e) => {
              const eSplit = e.split("_") as [string, number, number, number];
              return grid[eSplit[1]]?.[eSplit[2]]?.[eSplit[3]];
            });
          };
          const getDownList = () => {
            if (index === 0) return [];
            if (index % 2 === 0) {
              return [
                `main_${index - 1}_${index1}_${index2}`,
                `main_${index - 1}_${index1 + 1}_${index2}`,
                `main_${index - 1}_${index1}_${index2 + 1}`,
                `main_${index - 1}_${index1 + 1}_${index2 + 1}`,
              ].filter((e) => {
                const eSplit = e.split("_") as [string, number, number, number];
                return grid[eSplit[1]][eSplit[2]][eSplit[3]];
              });
            }
            return [
              `main_${index - 1}_${index1}_${index2}`,
              `main_${index - 1}_${index1 - 1}_${index2}`,
              `main_${index - 1}_${index1}_${index2 - 1}`,
              `main_${index - 1}_${index1 - 1}_${index2 - 1}`,
            ].filter((e) => {
              const eSplit = e.split("_") as [string, number, number, number];
              return grid[eSplit[1]]?.[eSplit[2]]?.[eSplit[3]];
            });
          };
          createCard(app, item2, {
            x:
              (window.innerWidth - size * model.cardWidth) / 2 +
              index2 * model.cardWidth,
            y:
              model.cardHeight * (0.5 + index1) +
              (index % 2 === 0 ? 0.5 * model.cardHeight : 0),
            upList: getUpList(),
            downList: getDownList(),
            name: `main_${index}_${index1}_${index2}`,
          });
        });
      });
    });
  }, []);

  return (
    <div style={{ height: "100%", position: "relative" }}>
      <div className="App" style={{ height: "100%" }}></div>
      {showStartModal && (
        <div
          style={{
            position: "absolute",
            width: "60%",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            padding: "10px",
            background: "pink",
            border: "3px solid pink",
            borderRadius: "5px",
          }}
        >
          <div style={{ textAlign: "left", color: "#007acc" }}>
            坤坤有点事，你能帮忙照看一下餐馆吗？
          </div>
          <button
            onClick={() => {
              setShowStartModal(false);
              model.isOnMask = false;
              model.mask!.visible = false;
            }}
          >
            开始
          </button>
        </div>
      )}
      {showFailModal && (
        <div
          style={{
            position: "absolute",
            width: "60%",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            padding: "10px",
            background: "black",
            borderRadius: "5px",
          }}
        >
          <div style={{ textAlign: "left", color: "#fff" }}>
            小黑子，露出鸡脚了吧！！
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
