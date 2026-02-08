
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'avatar_url');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Packages table
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('natureza', 'cidade')),
  image_url TEXT NOT NULL DEFAULT '',
  gallery TEXT[] DEFAULT '{}',
  location TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view packages" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Admins can insert packages" ON public.packages FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update packages" ON public.packages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete packages" ON public.packages FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.packages(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed packages
INSERT INTO public.packages (title, description, price, category, image_url, location, duration, featured, gallery) VALUES
('Fernando de Noronha Paradise', 'Explore praias cristalinas e mergulhe com golfinhos no arquipélago mais bonito do Brasil. Inclui hospedagem em pousada ecológica, passeios de barco e trilhas guiadas.', 4500.00, 'natureza', 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800', 'Fernando de Noronha, PE', '5 dias', true, ARRAY['https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800']),
('Tokyo Neon Nights', 'Descubra a capital da tecnologia e tradição. Visite templos antigos, prove a melhor culinária japonesa e explore Akihabara e Shibuya.', 8900.00, 'cidade', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'Tóquio, Japão', '7 dias', true, ARRAY['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800','https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800']),
('Chapada dos Veadeiros Trek', 'Aventura completa pela Chapada dos Veadeiros com trilhas, cachoeiras e noites estreladas no cerrado goiano.', 2800.00, 'natureza', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'Alto Paraíso, GO', '4 dias', false, ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800']),
('Paris Romance Tour', 'A cidade luz te espera. Torre Eiffel, Louvre, cruzeiro pelo Sena e os melhores cafés parisienses em um roteiro inesquecível.', 7500.00, 'cidade', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 'Paris, França', '6 dias', true, ARRAY['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800','https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800']),
('Amazônia Selvagem', 'Expedição pela floresta amazônica com guias nativos. Navegue pelos rios, aviste animais selvagens e durma em lodges sustentáveis.', 3200.00, 'natureza', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800', 'Manaus, AM', '5 dias', false, ARRAY['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800','https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800']),
('New York City Explorer', 'A cidade que nunca dorme: Times Square, Central Park, Estátua da Liberdade, Broadway e a melhor pizza do mundo.', 6800.00, 'cidade', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', 'Nova York, EUA', '5 dias', false, ARRAY['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800','https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800']),
('Lençóis Maranhenses', 'Dunas brancas e lagoas azuis cristalinas em um dos cenários mais surreais do planeta. Inclui passeio de 4x4 e voo panorâmico.', 3600.00, 'natureza', 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', 'Barreirinhas, MA', '4 dias', true, ARRAY['https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800']),
('Barcelona Art & Beach', 'Gaudi, tapas e praias mediterrâneas. Explore La Sagrada Família, Las Ramblas e o bairro gótico nesta joia espanhola.', 5900.00, 'cidade', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', 'Barcelona, Espanha', '6 dias', false, ARRAY['https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800','https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800']),
('Bonito Eco Adventure', 'Flutuação em rios cristalinos, rapel em cachoeiras e grutas com lagos azuis. A capital do ecoturismo brasileiro.', 2400.00, 'natureza', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800', 'Bonito, MS', '4 dias', false, ARRAY['https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800','https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800']),
('Dubai Luxury Experience', 'O futuro é agora em Dubai. Burj Khalifa, safári no deserto, compras no Dubai Mall e jantar no Burj Al Arab.', 9500.00, 'cidade', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 'Dubai, EAU', '5 dias', true, ARRAY['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800','https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800']);
