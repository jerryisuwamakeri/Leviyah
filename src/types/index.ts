export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: "active" | "inactive" | "banned";
}

export interface Staff {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  employee_id: string;
  department?: string;
  position?: string;
  hourly_rate?: number;
  qr_code: string;
  status: "active" | "inactive" | "suspended";
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  products_count?: number;
  children?: Category[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku?: string;
  color?: string;
  color_hex?: string;
  length?: string;
  size?: string;
  price: number;
  sale_price?: number;
  effective_price: number;
  stock_quantity: number;
  image?: string;
  is_active: boolean;
  label: string;
}

export interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  base_price: number;
  sale_price?: number;
  effective_price: number;
  stock_quantity: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  has_variants: boolean;
  product_type: "simple" | "variable";
  thumbnail?: string;
  thumbnail_url?: string;
  is_active: boolean;
  is_featured: boolean;
  average_rating: number;
  views: number;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  primary_image?: ProductImage;
}

export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  category: string;
  expense_date: string;
  reference?: string;
  staff_id?: number;
  staff?: Staff;
  created_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product_variant_id?: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  product: Product;
  variant?: ProductVariant;
}

export interface Cart {
  id: number;
  coupon_code?: string;
  discount_amount: number;
  items: CartItem[];
  subtotal: number;
  total: number;
  item_count: number;
}

export interface Address {
  id: number;
  label: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  is_default: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_variant_id?: number;
  product_name: string;
  variant_info?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  thumbnail?: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: number;
  order_number: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  notes?: string;
  tracking_number?: string;
  shipping_address?: Address;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  items: OrderItem[];
  user?: User;
  transaction?: Transaction;
}

export interface Transaction {
  id: number;
  order_id: number;
  reference: string;
  gateway: string;
  status: "pending" | "success" | "failed" | "refunded";
  amount: number;
  currency: string;
  paid_at?: string;
  created_at: string;
  order?: Order;
  user?: User;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_type: string;
  sender_id: number;
  body: string;
  attachment?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender?: User | Staff;
}

export interface Conversation {
  id: number;
  user_id: number;
  staff_id?: number;
  subject?: string;
  status: "open" | "closed" | "pending";
  last_message_at?: string;
  unread_messages_count?: number;
  created_at: string;
  user?: User;
  staff?: Staff;
  messages?: Message[];
  last_message?: Message;
}

export interface StaffAttendance {
  id: number;
  staff_id: number;
  date: string;
  clock_in_at?: string;
  clock_out_at?: string;
  hours_worked?: number;
  method: string;
}

export interface DashboardStats {
  total_revenue: number;
  monthly_revenue: number;
  today_revenue: number;
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  total_customers: number;
  new_customers: number;
  total_products: number;
  low_stock: number;
  out_of_stock: number;
  open_chats: number;
  total_expenses: number;
  net_profit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
