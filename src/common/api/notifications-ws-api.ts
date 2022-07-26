import { WsNotification } from '../store/notifications/types';
import { _t } from '../i18n';
import { requestNotificationPermission } from '../util/request-notification-permission';
import { ActiveUser } from '../store/active-user/types';
import defaults from '../constants/defaults.json';

declare var window: Window & {
  nws?: WebSocket;
}

export class NotificationsWebSocket {
  private activeUser: ActiveUser | null = null;
  private sound: HTMLAudioElement | null = null;
  private isElectron = false;
  private hasNotifications = false;
  private hasUiNotifications = false;
  private onSuccessCallbacks: Function[] = [];
  private toggleUiProp: Function = () => {
  };

  private static getBody(data: WsNotification) {
    const { source } = data;

    switch (data.type) {
      case 'vote':
        return _t('notification.voted', { source });
      case 'mention':
        return data.extra.is_post === 1
          ? _t('notification.mention-post', { source })
          : _t('notification.mention-comment', { source });
      case 'follow':
        return _t('notification.followed', { source });
      case 'reply':
        return _t('notification.replied', { source });
      case 'reblog':
        return _t('notification.reblogged', { source });
      case 'transfer':
        return _t('notification.transfer', { source, amount: data.extra.amount });
      case 'delegations':
        return _t('notification.delegations', { source, amount: data.extra.amount });
      default:
        return '';
    }
  }

  private async playSound() {
    if (!('Notification' in window)) {
      return;
    }
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') return;

    if (this.sound) {
      this.sound.muted = false;
      await this.sound.play();
    }
  }

  private onMessageReceive(evt: MessageEvent) {
    const logo = this.isElectron ? './img/logo-circle.svg' : require('../img/logo-circle.svg');

    const data = JSON.parse(evt.data);
    const msg = NotificationsWebSocket.getBody(data);

    if (msg) {
      this.onSuccessCallbacks.forEach(cb => cb());
      if (!this.hasNotifications) {
        return;
      }

      this.playSound();

      new Notification(_t('notification.popup-title'), { body: msg, icon: logo }).onclick = () => {
        if (!this.hasUiNotifications) {
          this.toggleUiProp('notifications');
        }
      };
    }

    window.nws!.onclose = (evt: CloseEvent) => {
      console.log('nws disconnected');

      window.nws = undefined;

      if (!evt.wasClean) {
        // Disconnected due connection error
        console.log('nws trying to reconnect');

        setTimeout(() => {
          this.connect();
        }, 2000);
      }
    };
  }

  public async connect() {
    if (!this.activeUser) {
      this.disconnect();
      return;
    }

    if (window.nws !== undefined) {
      return;
    }

    if ('Notification' in window) {
      await requestNotificationPermission();
    }

    window.nws = new WebSocket(`${defaults.nwsServer}/ws?user=${this.activeUser.username}`);
    window.nws.onopen = () => console.log('nws connected');
    window.nws.onmessage = e => this.onMessageReceive(e);
  }

  public disconnect() {
    if (window.nws !== undefined) {
      window.nws.close();
      window.nws = undefined;
    }
  }

  public withActiveUser(activeUser: ActiveUser | null) {
    this.activeUser = activeUser;
    return this;
  }

  public withSound(element: HTMLAudioElement) {
    this.sound = element;
    return this;
  }

  public withElectron(isElectron: boolean) {
    this.isElectron = isElectron;
    return this;
  }

  public withToggleUi(toggle: Function) {
    this.toggleUiProp = toggle;
    return this;
  }

  public setHasNotifications(has: boolean) {
    this.hasNotifications = has;
    return this;
  }

  public withCallbackOnMessage(cb: Function) {
    this.onSuccessCallbacks.push(cb);
    return this;
  }

  public setHasUiNotifications(has: boolean) {
    this.hasUiNotifications = has;
    return this;
  }
}