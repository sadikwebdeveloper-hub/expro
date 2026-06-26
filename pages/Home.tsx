import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { backend } from '../services/backend';
import { Achievement, Product, NewsItem, HeroSlide, AboutContent, Company, SiteConfig, Partner, ServiceCard, Director } from '../types';
import { Preloader } from '../components/Preloader';

// --- Animated Reveal Component ---
const RevealOnScroll: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect(); 
      }
    }, { threshold: 0.15 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
      {children}
    </div>
  );
};

// --- Number Counter Component ---
const NumberCounter = ({ target, duration = 2000 }: { target: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const numMatch = target.match(/\d+/);
  const endValue = numMatch ? parseInt(numMatch[0], 10) : 0;
  const suffix = target.replace(/\d+/, '');

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || endValue === 0) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * endValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isVisible, endValue, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// --- Hero Section ---
const HeroSection = ({ slides }: { slides: HeroSlide[] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear transform scale-100 hover:scale-110"
            style={{ backgroundImage: `url(${slide.image})` }}
          ></div>
          <div className="absolute inset-0 bg-black/50 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-6 container mx-auto text-white">
            <RevealOnScroll>
              <h5 className={`text-yellow-400 font-bold tracking-[0.2em] mb-4 text-lg uppercase`}>
                {slide.subtitle}
              </h5>
              <h1 className={`text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight max-w-4xl shadow-black drop-shadow-lg`}>
                {slide.title}
              </h1>
              <p className={`text-xl md:text-2xl text-gray-200 max-w-2xl mb-10 leading-relaxed`}>
                {slide.description}
              </p>
              <div>
                <Link 
                  to={slide.link} 
                  className="bg-blue-600 text-white px-10 py-4 rounded-sm font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-500/30 uppercase tracking-widest text-sm inline-block"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      ))}
    </div>
  );
};

export const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);

  useEffect(() => {
    // Parallel fetching for speed and efficiency
    const loadData = async () => {
      const p1 = backend.getSlides().then(setSlides);
      const p2 = backend.getAboutContent().then(setAbout);
      const p3 = backend.getCompanies().then(setCompanies);
      const p4 = backend.getProducts().then(setProducts);
      const p5 = backend.getNews().then(setNews);
      const p6 = backend.getPartners().then(setPartners);
      const p7 = backend.getServiceCards().then(setServices);
      const p8 = backend.getAchievements().then(setAchievements);
      const p9 = backend.getDirectors().then(setDirectors);
      
      await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9]);
      
      // Enforce a minimum display time for the branded animation (1.2 seconds)
      setTimeout(() => {
          setLoading(false);
      }, 1200);
    };
    loadData();
  }, []);

  if (loading) {
      return <Preloader />;
  }

  return (
    <div className="overflow-x-hidden animate-fade-in-up">
      {/* 1. Hero Section */}
      <HeroSection slides={slides} />

      {/* 2. Feature Cards Section (Overlapping) */}
      {services.length > 0 && (
         <section className="relative -mt-24 z-20 container mx-auto px-4 mb-20">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {services.slice(0, 3).map((s, index) => (
                   <RevealOnScroll key={s.id}>
                     <div className={`bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-blue-600 h-full`}>
                         <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-6">
                             <i className={`fas ${s.icon}`}></i>
                         </div>
                         <h3 className="text-xl font-bold mb-3 text-gray-900">{s.title}</h3>
                         <p className="text-gray-600 leading-relaxed">{s.description}</p>
                     </div>
                   </RevealOnScroll>
                 ))}
             </div>
         </section>
      )}

      {/* 3. Who We Are Section */}
      {about && (
        <section className="py-20 bg-white">
             <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                   <RevealOnScroll>
                     <div className="relative group">
                        <div className="absolute top-0 left-0 w-3/4 h-3/4 border-8 border-blue-50 rounded-3xl -z-10 transform -translate-x-6 -translate-y-6 transition-transform group-hover:-translate-x-8 group-hover:-translate-y-8"></div>
                        <img 
                           src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80" 
                           alt="About Us" 
                           className="rounded-xl shadow-2xl w-full"
                        />
                        <div className="absolute bottom-10 right-10 bg-blue-600 text-white p-6 rounded-lg shadow-xl hidden md:block animate-float">
                            <p className="text-3xl font-bold">25+</p>
                            <p className="text-sm">Years of Experience</p>
                        </div>
                     </div>
                   </RevealOnScroll>

                   <RevealOnScroll>
                     <div>
                        <h6 className="text-blue-600 font-bold uppercase tracking-widest mb-4">Who We Are</h6>
                        <h2 className="text-4xl font-bold mb-6 font-serif text-gray-900">Building a Sustainable Future Together</h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6 text-justify">
                           {about.introText ? about.introText.substring(0, 400) : "We are committed to excellence..."}...
                        </p>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center">
                               <i className="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                               <span className="font-bold text-gray-700">Commitment to Quality</span>
                            </div>
                            <div className="flex items-center">
                               <i className="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                               <span className="font-bold text-gray-700">Sustainable Practices</span>
                            </div>
                            <div className="flex items-center">
                               <i className="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                               <span className="font-bold text-gray-700">Global Standards</span>
                            </div>
                        </div>
                        <Link to="/about" className="bg-gray-900 text-white px-8 py-3 rounded-md font-bold hover:bg-blue-700 transition shadow-lg">Read More About Us</Link>
                     </div>
                   </RevealOnScroll>
                </div>
             </div>
        </section>
      )}

      {/* 4. Chairman's Message */}
      {about && (
        <section className="py-24 bg-gray-50 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -mr-20 -mt-20"></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -ml-20 -mb-20"></div>

           <div className="container mx-auto px-4 relative z-10">
              <RevealOnScroll>
                <div className="grid md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-t-8 border-blue-600">
                    <div className="md:col-span-4 flex flex-col items-center text-center">
                        <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-gray-100 shadow-xl mb-6">
                            <img 
                                src={about.chairmanImage || "https://nexalite-org.github.io/storage/founder.png"} 
                                alt={about.chairmanName} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h3 className="text-2xl font-bold font-serif text-gray-900">{about.chairmanName}</h3>
                        <p className="text-blue-600 font-bold uppercase text-xs tracking-widest mt-1">Founder & Chairman</p>
                    </div>
                    <div className="md:col-span-8">
                        <i className="fas fa-quote-left text-5xl text-blue-100 mb-6 block"></i>
                        <h2 className="text-3xl font-bold mb-6 font-serif text-gray-800">A Message from Leadership</h2>
                        <div className="text-gray-600 leading-relaxed text-lg text-justify italic">
                            "{about.chairmanMessage}"
                        </div>
                        <div className="mt-8">
                            <Link to="/about/chairman" className="text-blue-600 font-bold hover:underline">Read Full Message <i className="fas fa-arrow-right ml-1"></i></Link>
                        </div>
                    </div>
                </div>
              </RevealOnScroll>
           </div>
        </section>
      )}

      {/* 5. Statistics / Counter Section */}
      {achievements.length > 0 && (
        <section className="py-24 bg-blue-900 text-white relative bg-fixed bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')"}}>
          <div className="absolute inset-0 bg-blue-900/90"></div>
          <div className="container mx-auto px-4 relative z-10">
            <RevealOnScroll>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {achievements.map(ach => (
                  <div key={ach.id} className="p-6 group hover:bg-white/5 rounded-xl transition duration-300">
                      <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition">
                        {ach.image ? <img src={ach.image} className="w-10 h-10 object-contain filter invert" /> : <i className="fas fa-trophy text-3xl text-yellow-400"></i>}
                      </div>
                      <h3 className="text-4xl md:text-5xl font-bold mb-2 text-white">
                        <NumberCounter target={ach.title ? ach.title.split(' ')[0] : '0'} />
                      </h3>
                      <p className="text-blue-200 uppercase tracking-wider text-xs font-bold">{ach.title ? ach.title.split(' ').slice(1).join(' ') : ''}</p>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* 6. Subsidiaries / Companies */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <RevealOnScroll>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h6 className="text-blue-600 tracking-widest uppercase mb-2 text-sm font-bold">Our Ecosystem</h6>
              <h2 className="text-4xl font-bold mb-4 font-serif">Our Companies & Subsidiaries</h2>
              <p className="text-gray-500">A diverse portfolio driving sustainable national progress.</p>
            </div>
          </RevealOnScroll>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.slice(0, 6).map(comp => (
              <RevealOnScroll key={comp.id}>
                <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group h-full">
                  <div className="w-16 h-16 bg-white text-blue-600 rounded-lg flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                     {comp.image ? (
                        <img src={comp.image} className="w-full h-full object-contain p-2" alt={comp.name} />
                     ) : (
                        <i className={`fas ${comp.icon}`}></i>
                     )}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{comp.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{comp.description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
          <div className="text-center mt-12">
             <Link to="/companies" className="inline-block border-2 border-blue-600 text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-600 hover:text-white transition">View All Subsidiaries</Link>
          </div>
        </div>
      </section>

      {/* 7. Featured Products */}
      {products.length > 0 && (
            <section className="py-24 bg-gray-50">
               <div className="container mx-auto px-4">
                  <RevealOnScroll>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                       <div className="mb-4 md:mb-0">
                          <h6 className="text-blue-600 tracking-widest uppercase mb-2 text-sm font-bold">What We Offer</h6>
                          <h2 className="text-4xl font-bold font-serif">Featured Products</h2>
                       </div>
                       <Link to="/products" className="text-gray-500 hover:text-blue-600 font-bold border-b-2 border-transparent hover:border-blue-600 pb-1 transition">View Catalog <i className="fas fa-arrow-right ml-1"></i></Link>
                    </div>
                  </RevealOnScroll>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {products.slice(0, 3).map(product => (
                        <RevealOnScroll key={product.id}>
                          <div className="group relative overflow-hidden rounded-xl shadow-lg h-96 cursor-pointer">
                             <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                             <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-2 group-hover:translate-y-0 transition">
                                <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2 block">{product.category}</span>
                                <h3 className="text-white text-2xl font-bold mb-2">{product.name}</h3>
                                <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition duration-500">Premium quality product from Expro Group.</p>
                             </div>
                          </div>
                        </RevealOnScroll>
                     ))}
                  </div>
               </div>
            </section>
      )}

      {/* 8. Latest News */}
      <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <RevealOnScroll>
              <div className="text-center mb-16">
                  <h6 className="text-blue-600 tracking-widest uppercase mb-2 text-sm font-bold">Press Room</h6>
                  <h2 className="text-4xl font-bold font-serif">Latest News & Events</h2>
              </div>
            </RevealOnScroll>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.slice(0, 3).map(item => (
                <RevealOnScroll key={item.id}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100 flex flex-col h-full">
                    <div className="overflow-hidden h-56 relative">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-900 px-3 py-1 text-xs font-bold rounded shadow">
                        {item.date}
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition line-clamp-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3 flex-grow">{item.content}</p>
                      <Link to="/media" className="text-blue-600 font-bold text-sm uppercase tracking-wider hover:underline mt-auto">Read Full Story <i className="fas fa-arrow-right ml-1 text-xs"></i></Link>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
      </section>

      {/* 9. Partners Section */}
      {partners.length > 0 && (
          <section className="py-16 bg-gray-50 border-t border-gray-200 overflow-hidden">
            <RevealOnScroll>
              <div className="container mx-auto px-4 mb-10 text-center">
                  <h6 className="text-blue-600 tracking-widest uppercase mb-2 text-xs font-bold">Trusted Network</h6>
                  <h2 className="text-2xl font-bold font-serif text-gray-400">Our Partners & Clients</h2>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-16 container mx-auto px-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition duration-500">
                  {partners.map(p => (
                      <div key={p.id}>
                          <img src={p.logo} alt={p.name} className="h-16 w-auto object-contain" title={p.name} />
                      </div>
                  ))}
              </div>
            </RevealOnScroll>
          </section>
      )}

      {/* 10. Board of Directors */}
      {directors.length > 0 && (
         <section className="py-24 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">
                <RevealOnScroll>
                  <div className="text-center mb-16">
                      <h6 className="text-blue-600 tracking-widest uppercase mb-2 text-sm font-bold">Leadership</h6>
                      <h2 className="text-4xl font-bold font-serif">Board of Directors</h2>
                      <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
                  </div>
                </RevealOnScroll>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {directors.map(dir => (
                      <RevealOnScroll key={dir.id}>
                        <div className="text-center group">
                            <div className="w-56 h-56 mx-auto rounded-full overflow-hidden border-8 border-gray-50 shadow-xl mb-8 relative">
                                <img src={dir.image || "https://placehold.co/200x200?text=Leader"} alt={dir.name} className="w-full h-full object-cover transition duration-700 transform group-hover:scale-110" />
                                <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                   <Link to="/about" className="text-white border border-white px-4 py-2 rounded-full text-sm hover:bg-white hover:text-blue-900 transition">View Profile</Link>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{dir.name}</h3>
                            <p className="text-blue-600 text-sm font-bold uppercase tracking-wider">{dir.position}</p>
                        </div>
                      </RevealOnScroll>
                    ))}
                </div>
            </div>
         </section>
      )}

      {/* 11. CTA / Contact Map Section */}
      <section className="py-20 bg-blue-900 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] opacity-10"></div>
         <div className="container mx-auto px-4 relative z-10 text-center">
            <RevealOnScroll>
              <h2 className="text-4xl font-bold font-serif mb-6">Ready to Collaborate?</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">We are always looking for new opportunities and partnerships to create sustainable value.</p>
              <div className="flex justify-center gap-6">
                  <Link to="/contact" className="bg-white text-blue-900 px-10 py-4 rounded-full font-bold hover:bg-gray-100 transition shadow-xl">Contact Us</Link>
                  <Link to="/companies" className="border-2 border-white text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-blue-900 transition shadow-xl">Our Portfolio</Link>
              </div>
            </RevealOnScroll>
         </div>
      </section>
    </div>
  );
};