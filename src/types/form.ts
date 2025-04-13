export interface FormLink {
  id: string;
  token: string;
  customer_id: string;
  created_at: string;
  expires_at: string;
  is_used: boolean;
}

export interface OfferFormData {
  customer_id: string;
  source: 'Email' | 'Phone' | 'Site' | 'Physical';
  amount: string;
  customer_comments: string;
  our_comments?: string;
  status: 'wait_for_our_answer' | 'wait_for_customer_answer' | 'ready';
}

export interface Customer {
  id: string;
  company_name: string;
  email?: string;
  telephone?: string;
}