import * as PIXI from "pixi.js";

export type Card = PIXI.Container<PIXI.DisplayObject> & {
  gameInfo?: {
    text: string;
    isCollected?: boolean;
    upList: string[];
    downList: string[];
  };
};

export interface Model {
  app?: PIXI.Application;
  collectorX: number;
  collectorY: number;
  collectorArray: Card[];
  bottomArray: Card[];
  cardWidth: number;
  cardHeight: number;
  isOnMask: boolean;
  mask?: PIXI.Graphics;
  menu?: PIXI.Container;
}
