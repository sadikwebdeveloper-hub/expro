import React, { useEffect, useState } from 'react';
import { backend } from '../services/backend';
import { SiteConfig } from '../types';
import { PageHero, Reveal } from '../components/ui';

type FormState = { name: string; email: string; phone: string; subject: string; message: string };
type Status = 'idle' | 'sending' | 'sent' | 'partial' | 'error';

const EMPTY: FormState = { name: '', email: '', phone: '', subject: '', message: '' };

export const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    let alive = true;
    backend.getConfig().then((c) => alive && setConfig(c));
    return () => { alive = false; };
  }, []);

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const result = await backend.sendMessage({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.phone ? `${form.message}\n\nPhone: ${form.phone}` : form.message,
      });

      if (result.emailDelivered) {
        setStatus('sent');
      } else {
        // Stored, but the mail notification did not go out — say so honestly.
        setStatus('partial');
      }
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const details = [
    {
      icon: 'fa-location-dot',
      label: 'Head Office',
      value: config?.address,
      href: config?.mapUrl ? undefined : undefined,
    },
    { icon: 'fa-phone-alt', label: 'Call Us', value: config?.phone, href: config?.phone ? `tel:${config.phone.replace(/\s/g, '')}` : undefined },
    { icon: 'fa-envelope', label: 'Email Us', value: config?.email, href: config?.email ? `mailto:${config.email}` : undefined },
  ].filter((item) => item.value);

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Let’s talk about what you’re building"
        subtitle="Questions, partnerships, press or careers — our team reads every message."
        image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600"
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <section className="py-20 sm:py-24">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Details */}
            <Reveal className="lg:col-span-5">
              <div className="relative h-full overflow-hidden rounded-3xl bg-ink-950 p-9 text-white sm:p-10">
                <div className="absolute inset-0 bg-mesh-hero opacity-70" aria-hidden />
                <div className="relative">
                  <h2 className="text-2xl font-bold sm:text-[1.75rem]">Get in touch</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-300">
                    Reach us directly, or send a message and we’ll come back to you within one business day.
                  </p>

                  <ul className="mt-10 space-y-7">
                    {details.map((item) => {
                      const Wrapper: React.ElementType = item.href ? 'a' : 'div';
                      return (
                        <li key={item.label}>
                          <Wrapper
                            {...(item.href ? { href: item.href } : {})}
                            className="group flex items-start gap-4"
                          >
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-brand-400 transition-colors group-hover:border-brand-400/50 group-hover:bg-brand-500 group-hover:text-white">
                              <i className={`fas ${item.icon}`} aria-hidden />
                            </span>
                            <span>
                              <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
                                {item.label}
                              </span>
                              <span className="mt-1 block whitespace-pre-line text-[15px] leading-relaxed text-ink-100">
                                {item.value}
                              </span>
                            </span>
                          </Wrapper>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="flex items-center gap-2.5 text-[13px] font-semibold text-brand-300">
                      <i className="fas fa-clock" aria-hidden /> Office hours
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-300">
                      Sunday – Thursday, 9:00 AM – 6:00 PM (GMT+6)
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Form */}
            <Reveal delay={120} className="lg:col-span-7">
              <div className="card h-full p-9 sm:p-10">
                <h2 className="text-2xl font-bold text-ink-900">Send a message</h2>
                <p className="mt-2 text-[14.5px] text-ink-500">
                  Fields marked with an asterisk are required.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="c-name" className="mb-2 block text-[13px] font-semibold text-ink-700">
                        Full name <span className="text-brand-600">*</span>
                      </label>
                      <input
                        id="c-name"
                        required
                        value={form.name}
                        onChange={update('name')}
                        placeholder="Ayesha Rahman"
                        autoComplete="name"
                        className="w-full rounded-xl border border-ink-900/12 bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-300 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12"
                      />
                    </div>
                    <div>
                      <label htmlFor="c-email" className="mb-2 block text-[13px] font-semibold text-ink-700">
                        Email address <span className="text-brand-600">*</span>
                      </label>
                      <input
                        id="c-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={update('email')}
                        placeholder="you@company.com"
                        autoComplete="email"
                        className="w-full rounded-xl border border-ink-900/12 bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-300 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="c-phone" className="mb-2 block text-[13px] font-semibold text-ink-700">
                        Phone <span className="text-ink-300">(optional)</span>
                      </label>
                      <input
                        id="c-phone"
                        type="tel"
                        value={form.phone}
                        onChange={update('phone')}
                        placeholder="+880 1XXX XXXXXX"
                        autoComplete="tel"
                        className="w-full rounded-xl border border-ink-900/12 bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-300 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12"
                      />
                    </div>
                    <div>
                      <label htmlFor="c-subject" className="mb-2 block text-[13px] font-semibold text-ink-700">
                        Subject <span className="text-brand-600">*</span>
                      </label>
                      <input
                        id="c-subject"
                        required
                        value={form.subject}
                        onChange={update('subject')}
                        placeholder="Partnership enquiry"
                        className="w-full rounded-xl border border-ink-900/12 bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-300 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="c-message" className="mb-2 block text-[13px] font-semibold text-ink-700">
                      Message <span className="text-brand-600">*</span>
                    </label>
                    <textarea
                      id="c-message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={update('message')}
                      placeholder="Tell us a little about what you need…"
                      className="w-full resize-y rounded-xl border border-ink-900/12 bg-white px-4 py-3 text-[15px] leading-relaxed text-ink-900 placeholder:text-ink-300 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12"
                    />
                  </div>

                  {/* Status messages reflect what the server actually reported. */}
                  {status === 'error' && (
                    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-700">
                      <i className="fas fa-circle-exclamation mt-0.5" aria-hidden />
                      <span>
                        <strong className="font-bold">We couldn’t send that.</strong> {errorMessage}
                      </span>
                    </div>
                  )}

                  {status === 'partial' && (
                    <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-[14px] text-amber-800">
                      <i className="fas fa-triangle-exclamation mt-0.5" aria-hidden />
                      <span>
                        <strong className="font-bold">Message received.</strong> Our email notification service is
                        currently unavailable, so please allow a little longer for a reply.
                      </span>
                    </div>
                  )}

                  {status === 'sent' && (
                    <div role="status" className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 px-5 py-4 text-[14px] text-brand-800">
                      <i className="fas fa-circle-check mt-0.5" aria-hidden />
                      <span>
                        <strong className="font-bold">Thank you — your message is on its way.</strong> We’ll reply
                        within one business day.
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="btn-primary min-w-[13rem]"
                    >
                      {status === 'sending' ? (
                        <>
                          <i className="fas fa-circle-notch animate-spin" aria-hidden /> Sending…
                        </>
                      ) : (
                        <>Send message <i className="fas fa-paper-plane text-sm" aria-hidden /></>
                      )}
                    </button>
                    <p className="flex items-center gap-2 text-[12.5px] text-ink-400">
                      <i className="fas fa-lock text-[10px] text-brand-500" aria-hidden />
                      Your details are never shared.
                    </p>
                  </div>
                </form>
              </div>
            </Reveal>
          </div>

          {/* Map */}
          {config?.mapUrl && (
            <Reveal>
              <div className="mt-6 overflow-hidden rounded-3xl border border-ink-900/[0.07] shadow-soft">
                <iframe
                  title="Expro Group office location"
                  src={config.mapUrl}
                  width="100%"
                  height="460"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
};
