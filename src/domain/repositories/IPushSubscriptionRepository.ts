export interface PushSubscription {
  userId: string;
  endpoint: string;
  keysAuth: string;
  keysP256dh: string;
}

export interface IPushSubscriptionRepository {
  save(subscription: PushSubscription): Promise<void>;
  findByUserId(userId: string): Promise<PushSubscription[]>;
  findByUserIds(userIds: string[]): Promise<PushSubscription[]>;
  remove(userId: string, endpoint: string): Promise<void>;
}
