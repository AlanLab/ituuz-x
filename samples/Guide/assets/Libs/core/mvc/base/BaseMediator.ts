import { Facade } from "../Facade";
import CommandManager from "../manager/CommandManager";
import NotificationManager from "../manager/NotificationManager";
import { ViewManager } from "../manager/ViewManager";
import BaseCommand from "./BaseCommand";
import BaseModel from "./BaseModel";
import { BaseView } from "./BaseView";
import GameContent from "./GameContent";

/**
 * 视图中介者基类
 * @author ituuz
 * @description 生命周期
 *      BaseMediator.init
 *      BaseView.__init__
 *      BaseMediator.viewDidAppear
 */
export default abstract class BaseMediator {
    /** 界面唯一id */
    private _uuid: string;
    /** 中介者名称 */
    public medName: any;
    /** 当前场景content */
    private _sceneContent: GameContent;
    /** 当前中介者持有的view视图 */
    public view: BaseView;
    /** 当前中介者中注册的消息列表 */
    private _notiMap: Map<string | number, {key: string | number, cb: (data: any) => void, target: any}>;

    /**
     * 初始化接口,此时视图还没有创建，如果想操作视图view请在viewDidAppear函数中进行。
     * @param {Object} data 自定义的任意类型透传数据。（可选）
     * @override
     */
    public abstract init(data?: any): void;

    /**
     * 内部初始化使用，外部不要调用。
     * @param {string} uuid 界面唯一id
     * @private
     */
    private __init__(uuid: string): void {
        this._uuid = uuid;
        let content = ViewManager.getInstance().curScene._sceneContent;
        if (content) {
            this._sceneContent = content;
        } else {
            this._sceneContent = new GameContent();
        }
        this._notiMap = new Map<string, {key: string, cb: (data: any) => void, target: any}>();
        this.customInit();
    }

    /** 自定义初始化接口 */
    public customInit(): void {

    }

    /** 视图创建完成显示时会调用的接口 */
    public abstract viewDidAppear(): void;
    /** 从底层显示到最上层时调用 */
    public __onAppear__(): void {
        this.onAppear();
    }
    public abstract onAppear(): void;
    /** 从最上层被其他View遮挡变成下层时调用 */
    public __onDisappear__(): void {
        this.onDisappear();
    }
    public abstract onDisappear(): void;

    /**
     * 绑定UI事件，接收view层派发的事件。
     * @param {string} name 事件名称
     * @param {(any)=>void} cb 事件回调
     * @param {BaseMediator} target 回调绑定对象
     */
    public bindEvent(name: string, cb: (body: any) => void, target: BaseMediator): void {
        this.view.__bindEvent__(name, cb, target);
    }

    /**
     * 注册消息监听
     * @param {string | number} noti 通知key值
     * @param {(data: any)=>void} cb 通知监听的回调函数
     * @param {Object} target 回调绑定的对象
     */
    public registerNoti(noti: string | number, cb: (data: any) => void, target: any): void {
        this._notiMap.set(noti, {key: noti, cb, target});
    }

    /**
     * 发送消息通知
     * @param {string | number} noti 通知key值
     * @param {Object} body 消息传递的参数
     */
    public sendNoti(noti: string | number, body?: any): void {
        NotificationManager.getInstance().__sendNotification__(noti, body);
    }

    /**
     * 发送命令接口
     * @param {{new (): BaseCommand}} cmd 命令类
     * @param {Object} data 命令参数
     */
    public sendCmd<T extends BaseCommand>(cmd: new () => T, data?: any): void {
        CommandManager.getInstance().__executeCommand__(cmd, data);
    }

    /**
     * 返回上一场景
     * @returns {boolean}是否存在上一个场景
     */
    public backScene(): boolean {
        return Facade.getInstance().backScene();
    }

    /**
     * 获取model对象
     * @param {{new (): BaseModel}} model
     */
    public getModel<T extends BaseModel>(model: new () => T): T {
        return Facade.getInstance().getModel(model);
    }

    /** 游戏从后台激活 */
    public onGameShow(): void { }
    /** 游戏进入后台 */
    public onGameHide(): void { }

    private __destroy__(): void {
        this.view.__onClose__();
        this.destroy();
    }

    public get sceneContent(): GameContent {
        return this._sceneContent;
    }

    /**
     * 销毁接口
     * @override
     */
    public abstract destroy(): void;

    /**************************** getter and setter ******************************/
    public get uuid(): string {
        return this._uuid;
    }
}
