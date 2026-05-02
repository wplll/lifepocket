import { LifeItemStatus, LifeItemType, LifeListType } from "@/types/life";

export const LIFE_ITEM_TYPE_META: Record<LifeItemType, {
  label: string;
  description: string;
  color: string;
  icon: string;
}> = {
  expense: {
    label: "消费记录",
    description: "已经发生的消费，例如小票、支付截图、消费账单。",
    color: "#dc6803",
    icon: "receipt-outline"
  },
  bill: {
    label: "待支付账单",
    description: "还需要支付或关注的账单，例如水电费、信用卡、物业费。",
    color: "#b42318",
    icon: "card-outline"
  },
  appointment: {
    label: "预约日程",
    description: "看病、会议、课程、活动等有明确时间的事项。",
    color: "#2563eb",
    icon: "calendar-outline"
  },
  shopping: {
    label: "购物订单",
    description: "购物、订单、快递、采购相关信息。",
    color: "#7c3aed",
    icon: "bag-handle-outline"
  },
  travel: {
    label: "旅行行程",
    description: "机票、酒店、旅行计划和出行安排。",
    color: "#047857",
    icon: "airplane-outline"
  },
  warranty: {
    label: "保修凭证",
    description: "发票、保修卡、商品保修截止日期等。",
    color: "#0f766e",
    icon: "shield-checkmark-outline"
  },
  todo: {
    label: "待办事项",
    description: "需要用户完成的普通事项。",
    color: "#475467",
    icon: "checkbox-outline"
  },
  note: {
    label: "普通备忘",
    description: "暂时无法归入其他类型的信息记录。",
    color: "#667085",
    icon: "document-text-outline"
  },
  unknown: {
    label: "未知类型",
    description: "AI 暂时无法判断类型，可手动修改。",
    color: "#344054",
    icon: "help-circle-outline"
  }
};

export const LIFE_ITEM_STATUS_META: Record<LifeItemStatus, {
  label: string;
  description: string;
}> = {
  active: {
    label: "待处理",
    description: "仍需关注，会优先显示在首页。"
  },
  done: {
    label: "已完成",
    description: "事项已处理完成，保留为历史记录。"
  },
  archived: {
    label: "已归档",
    description: "不再显示在主要列表，但仍可在历史中查看。归档不是删除。"
  }
};

export const LIFE_LIST_TYPE_LABELS: Record<LifeListType, string> = {
  shopping: "购物清单",
  travel: "旅行清单",
  packing: "打包清单",
  todo: "待办清单",
  custom: "自定义清单"
};

export const typeLabels = Object.fromEntries(
  Object.entries(LIFE_ITEM_TYPE_META).map(([key, value]) => [key, value.label])
) as Record<LifeItemType, string>;

export const statusLabels = Object.fromEntries(
  Object.entries(LIFE_ITEM_STATUS_META).map(([key, value]) => [key, value.label])
) as Record<LifeItemStatus, string>;

export function getLifeItemTypeMeta(type: unknown) {
  return LIFE_ITEM_TYPE_META[isLifeItemType(type) ? type : "unknown"];
}

export function getLifeItemStatusMeta(status: unknown) {
  return LIFE_ITEM_STATUS_META[isLifeItemStatus(status) ? status : "active"];
}

export function isLifeItemType(type: unknown): type is LifeItemType {
  return typeof type === "string" && type in LIFE_ITEM_TYPE_META;
}

export function isLifeItemStatus(status: unknown): status is LifeItemStatus {
  return typeof status === "string" && status in LIFE_ITEM_STATUS_META;
}
