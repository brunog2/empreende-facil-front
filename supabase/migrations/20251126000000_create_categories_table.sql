-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Users can view their own categories" ON public.categories 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" ON public.categories 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON public.categories 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON public.categories 
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_categories_user_id ON public.categories(user_id);


