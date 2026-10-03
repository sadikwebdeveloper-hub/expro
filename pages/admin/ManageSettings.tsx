import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { AppSettings } from '../../types';

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => (
  <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <span className="relative inline-flex shrink-0 items-center">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2 peer-checked:bg-emerald-500 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
    </span>
  </label>
);

const Section: React.FC<{
  title: string;
  description?: string;
  icon: string;
  className?: string;
  children: React.ReactNode;
}> = ({ title, description, icon, className = '', children }) => (
  <section className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-6 ${className}`}>
    <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        <i className={`fas ${icon}`} aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>}
      </div>
    </div>
    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
  </section>
);

const Field: React.FC<{
  label: string;
  name: string;
  value: string | number;
  onChange: (name: string, value: string) => void;
  type?: string;
  className?: string;
  placeholder?: string;
}> = ({ label, name, value, onChange, type = 'text', className = '', placeholder }) => (
  <div className={`min-w-0 ${className}`}>
    <label htmlFor={`setting-${name}`} className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label>
    <input
      id={`setting-${name}`}
      type={type}
      className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
      name={name}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(event) => onChange(name, event.target.value)}
    />
  </div>
);

const TextareaField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  className?: string;
}> = ({ label, name, value, onChange, className = '' }) => (
  <div className={`min-w-0 ${className}`}>
    <label htmlFor={`setting-${name}`} className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label>
    <textarea
      id={`setting-${name}`}
      rows={3}
      className="w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
      value={value ?? ''}
      onChange={(event) => onChange(name, event.target.value)}
    />
  </div>
);

export const ManageSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingSiteStatus, setSavingSiteStatus] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [smtpTestResult, setSmtpTestResult] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [editEmail, setEditEmail] = useState<{ old: string; value: string } | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    let alive = true;
    backend.getSettings()
      .then((data) => { if (alive) setSettings(data); })
      .catch((error: any) => { if (alive) setErr(error?.message || 'Failed to load settings'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const showMsg = (text: string, isError = false) => {
    if (isError) {
      setErr(text);
      setMsg('');
    } else {
      setMsg(text);
      setErr('');
    }
    window.setTimeout(() => {
      setMsg('');
      setErr('');
    }, 4500);
  };

  const patch = (section: keyof AppSettings, name: string, value: string | boolean | number) => {
    setSettings((current) => current && ({
      ...current,
      [section]: { ...current[section], [name]: value },
    }));
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    try {
      const updated = await backend.updateSettings(settings, smtpPassword || undefined);
      setSettings({ ...updated, systemStatus: settings.systemStatus });
      setSmtpPassword('');
      showMsg('Settings saved successfully.');
    } catch (error: any) {
      showMsg(error?.message || 'Save failed. Please try again.', true);
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleSiteStatus = async () => {
    if (!settings) return;
    const takeOffline = !settings.general.maintenanceMode;
    if (takeOffline && !window.confirm('Take the public website offline now? Visitors will see the maintenance screen. Admin access will remain available.')) {
      return;
    }

    setSavingSiteStatus(true);
    try {
      const updated = await backend.setMaintenanceMode(takeOffline, settings.general.maintenanceMessage);
      setSettings((current) => current && ({
        ...current,
        general: { ...current.general, ...updated.general },
        systemStatus: current.systemStatus,
      }));
      showMsg(takeOffline
        ? 'Public website is now in maintenance mode. Admin access is still available.'
        : 'Public website is back online.');
    } catch (error: any) {
      showMsg(error?.message || 'Could not update public site status.', true);
    } finally {
      setSavingSiteStatus(false);
    }
  };

  const saveSmtpOnly = async () => {
    if (!settings) return;
    try {
      const updated = await backend.updateSettings({ smtp: settings.smtp }, smtpPassword || undefined);
      setSettings((current) => current && ({ ...current, smtp: updated.smtp }));
      setSmtpPassword('');
      showMsg('SMTP settings saved.');
    } catch (error: any) {
      showMsg(error?.message || 'SMTP save failed.', true);
    }
  };

  const testSmtp = async () => {
    if (!settings) return;
    setSmtpTestResult('Testing connection…');
    try {
      const result = await backend.testSmtp(
        testEmail || settings.contact.email,
        settings.smtp,
        smtpPassword || undefined,
      );
      setSmtpTestResult(result.success ? '✓ SMTP connected successfully.' : `Connection failed: ${result.message}`);
    } catch (error: any) {
      setSmtpTestResult(`Connection failed: ${error?.message || 'SMTP authentication error.'}`);
    }
  };

  const addEmail = async () => {
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    try {
      const emails = await backend.addContactEmail(newEmail.trim());
      setSettings((current) => current && ({ ...current, contact: { ...current.contact, notificationEmails: emails } }));
      setNewEmail('');
      showMsg('Notification email added.');
    } catch (error: any) {
      showMsg(error?.message || 'Could not add email.', true);
    } finally {
      setSavingEmail(false);
    }
  };

  const removeEmail = async (email: string) => {
    try {
      const emails = await backend.removeContactEmail(email);
      setSettings((current) => current && ({ ...current, contact: { ...current.contact, notificationEmails: emails } }));
      showMsg('Notification email removed.');
    } catch (error: any) {
      showMsg(error?.message || 'Could not remove email.', true);
    }
  };

  const saveEditEmail = async () => {
    if (!editEmail) return;
    try {
      const emails = await backend.updateContactEmail(editEmail.old, editEmail.value);
      setSettings((current) => current && ({ ...current, contact: { ...current.contact, notificationEmails: emails } }));
      setEditEmail(null);
      showMsg('Notification email updated.');
    } catch (error: any) {
      showMsg(error?.message || 'Could not update email.', true);
    }
  };

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;
    try {
      const result = await backend.uploadLogo(file);
      setSettings({ ...settings, branding: { ...settings.branding, logoUrl: result.logoUrl } });
      showMsg('Logo uploaded. Save all settings to apply other pending changes.');
    } catch (error: any) {
      showMsg(error?.message || 'Logo upload failed.', true);
    }
  };

  const uploadFavicon = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;
    try {
      const result = await backend.uploadFavicon(file);
      setSettings({ ...settings, branding: { ...settings.branding, faviconUrl: result.faviconUrl } });
      showMsg('Favicon uploaded.');
    } catch (error: any) {
      showMsg(error?.message || 'Favicon upload failed.', true);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-5" aria-busy="true">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-36 animate-pulse rounded-2xl bg-white" />
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><i className="fas fa-triangle-exclamation" aria-hidden /></span>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Settings unavailable</h2>
        <p className="mt-2 text-sm text-slate-600">{err || 'The settings could not be loaded. Refresh and try again.'}</p>
      </div>
    );
  }

  const maintenanceMode = Boolean(settings.general.maintenanceMode);

  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Configuration</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Global site settings</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">Manage site availability, identity, contact details and integrations.</p>
        </div>
      </div>

      {(msg || err) && (
        <div role={err ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm ${err ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          <i className={`fas ${err ? 'fa-circle-exclamation' : 'fa-circle-check'} mt-0.5`} aria-hidden />
          <span className="min-w-0 flex-1">{err || msg}</span>
          <button type="button" onClick={() => { setMsg(''); setErr(''); }} aria-label="Dismiss notification" className="rounded p-1 opacity-70 hover:opacity-100">
            <i className="fas fa-xmark" aria-hidden />
          </button>
        </div>
      )}

      <section className={`overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-5 ${maintenanceMode ? 'border-amber-200 bg-amber-50/70' : 'border-emerald-200 bg-emerald-50/60'}`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg ${maintenanceMode ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <i className={`fas ${maintenanceMode ? 'fa-power-off' : 'fa-globe'} `} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Public website</h3>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${maintenanceMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${maintenanceMode ? 'bg-amber-500' : 'bg-emerald-500'}`} aria-hidden />
                  {maintenanceMode ? 'Offline' : 'Live'}
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
                {maintenanceMode
                  ? 'Visitors are seeing the maintenance screen. Admin login and this control panel remain available.'
                  : 'Your public pages are available to visitors. You can temporarily show a maintenance screen with one click.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleSiteStatus}
            disabled={savingSiteStatus}
            className={`inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:cursor-wait disabled:opacity-60 sm:w-auto ${maintenanceMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}
          >
            {savingSiteStatus ? <i className="fas fa-spinner animate-spin" aria-hidden /> : <i className={`fas ${maintenanceMode ? 'fa-rotate-left' : 'fa-power-off'}`} aria-hidden />}
            {savingSiteStatus ? 'Updating…' : maintenanceMode ? 'Bring site online' : 'Take site offline'}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Section title="General" description="Core site identity and maintenance notice." icon="fa-sliders">
          <Field label="Website name" name="websiteName" value={settings.general.websiteName} onChange={(name, value) => patch('general', name, value)} />
          <Field label="Timezone" name="timezone" value={settings.general.timezone} onChange={(name, value) => patch('general', name, value)} />
          <Field label="Currency" name="currency" value={settings.general.currency} onChange={(name, value) => patch('general', name, value)} />
          <Field label="Language" name="language" value={settings.general.language} onChange={(name, value) => patch('general', name, value)} />
          <TextareaField
            label="Message shown while the site is offline"
            name="maintenanceMessage"
            value={settings.general.maintenanceMessage}
            onChange={(name, value) => patch('general', name, value)}
            className="md:col-span-2"
          />
        </Section>

        <Section title="Branding" description="Logo and browser tab icon." icon="fa-swatchbook">
          <div className="min-w-0">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Website logo</label>
            <div className="mb-3 grid h-20 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
              {settings.branding.logoUrl
                ? <img src={settings.branding.logoUrl} alt="Current website logo" className="max-h-14 max-w-full object-contain" />
                : <span className="text-xs text-slate-400">No logo uploaded</span>}
            </div>
            <input type="file" accept="image/*" onChange={uploadLogo} className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-emerald-50" />
          </div>
          <div className="min-w-0">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Favicon</label>
            <div className="mb-3 grid h-20 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
              {settings.branding.faviconUrl
                ? <img src={settings.branding.faviconUrl} alt="Current favicon" className="max-h-12 max-w-full object-contain" />
                : <span className="text-xs text-slate-400">No favicon uploaded</span>}
            </div>
            <input type="file" accept="image/*" onChange={uploadFavicon} className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-emerald-50" />
          </div>
          <Field label="Logo URL (fallback)" name="logoUrl" value={settings.branding.logoUrl} onChange={(_, value) => setSettings({ ...settings, branding: { ...settings.branding, logoUrl: value } })} className="md:col-span-2" />
        </Section>

        <Section title="Contact information" description="Details displayed across the public website." icon="fa-address-card">
          <Field label="Phone" name="phone" value={settings.contact.phone} onChange={(name, value) => patch('contact', name, value)} type="tel" />
          <Field label="Email" name="email" value={settings.contact.email} onChange={(name, value) => patch('contact', name, value)} type="email" />
          <Field label="Support email" name="supportEmail" value={settings.contact.supportEmail} onChange={(name, value) => patch('contact', name, value)} type="email" />
          <Field label="Office address" name="address" value={settings.contact.address} onChange={(name, value) => patch('contact', name, value)} className="md:col-span-2" />
          <Field label="Google Maps embed URL" name="mapUrl" value={settings.contact.mapUrl} onChange={(name, value) => patch('contact', name, value)} className="md:col-span-2" />
        </Section>

        <Section title="Contact notifications" description="Choose where new contact form messages are delivered." icon="fa-paper-plane">
          <div className="md:col-span-2">
            <label htmlFor="new-notification-email" className="mb-1.5 block text-xs font-semibold text-slate-700">Notification email addresses</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="new-notification-email"
                type="email"
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                placeholder="admin@example.com"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addEmail(); } }}
              />
              <button type="button" onClick={addEmail} disabled={savingEmail || !newEmail.trim()} className="min-h-11 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                {savingEmail ? 'Adding…' : 'Add email'}
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {settings.contact.notificationEmails?.map((email) => (
                <div key={email} className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 sm:flex-row sm:items-center">
                  {editEmail?.old === email ? (
                    <>
                      <input aria-label={`Edit ${email}`} type="email" className="min-h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400" value={editEmail.value} onChange={(event) => setEditEmail({ ...editEmail, value: event.target.value })} />
                      <div className="flex items-center gap-3 sm:shrink-0">
                        <button type="button" onClick={saveEditEmail} className="text-sm font-bold text-emerald-700 hover:text-emerald-800">Save</button>
                        <button type="button" onClick={() => setEditEmail(null)} className="text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1 break-all text-sm text-slate-700">{email}</span>
                      <div className="flex items-center gap-3 sm:shrink-0">
                        <button type="button" onClick={() => setEditEmail({ old: email, value: email })} className="text-sm font-semibold text-sky-700 hover:text-sky-800">Edit</button>
                        <button type="button" onClick={() => removeEmail(email)} aria-label={`Remove ${email}`} className="grid h-8 w-8 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50">
                          <i className="fas fa-trash-can text-xs" aria-hidden />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {!settings.contact.notificationEmails?.length && <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400">No notification addresses have been added.</p>}
            </div>
          </div>
        </Section>

        <Section title="Social links" description="Leave a field empty to hide that social link." icon="fa-share-nodes">
          <Field label="Facebook" name="facebook" value={settings.social.facebook} onChange={(name, value) => patch('social', name, value)} />
          <Field label="Instagram" name="instagram" value={settings.social.instagram} onChange={(name, value) => patch('social', name, value)} />
          <Field label="LinkedIn" name="linkedin" value={settings.social.linkedin} onChange={(name, value) => patch('social', name, value)} />
          <Field label="Twitter / X" name="twitter" value={settings.social.twitter} onChange={(name, value) => patch('social', name, value)} />
          <Field label="YouTube" name="youtube" value={settings.social.youtube} onChange={(name, value) => patch('social', name, value)} />
          <Field label="WhatsApp" name="whatsapp" value={settings.social.whatsapp} onChange={(name, value) => patch('social', name, value)} />
          <Field label="Telegram" name="telegram" value={settings.social.telegram} onChange={(name, value) => patch('social', name, value)} />
          <Field label="Messenger" name="messenger" value={settings.social.messenger} onChange={(name, value) => patch('social', name, value)} />
        </Section>

        <Section title="SEO & analytics" description="Search snippets and analytics identifiers." icon="fa-magnifying-glass-chart">
          <Field label="Meta title" name="metaTitle" value={settings.seo.metaTitle} onChange={(name, value) => patch('seo', name, value)} className="md:col-span-2" />
          <TextareaField label="Meta description" name="metaDescription" value={settings.seo.metaDescription} onChange={(name, value) => patch('seo', name, value)} className="md:col-span-2" />
          <Field label="Keywords" name="keywords" value={settings.seo.keywords} onChange={(name, value) => patch('seo', name, value)} className="md:col-span-2" />
          <Field label="Google Analytics ID" name="googleAnalyticsId" value={settings.seo.googleAnalyticsId} onChange={(name, value) => patch('seo', name, value)} />
          <Field label="Facebook Pixel ID" name="facebookPixelId" value={settings.seo.facebookPixelId} onChange={(name, value) => patch('seo', name, value)} />
        </Section>

        <Section title="Footer" description="Closing message shown at the bottom of the site." icon="fa-rectangle-list">
          <TextareaField label="Footer text" name="copyright" value={settings.footer.copyright} onChange={(name, value) => patch('footer', name, value)} className="md:col-span-2" />
        </Section>

        <Section title="Cloudinary storage" description="Media storage integration status." icon="fa-cloud-arrow-up">
          <div className="md:col-span-2 space-y-3 rounded-xl bg-slate-50 p-4">
            <p className="text-sm leading-relaxed text-slate-600">Cloudinary credentials are configured through your server environment.</p>
            <code className="block overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-600">CLOUDINARY_CLOUD_NAME · CLOUDINARY_API_KEY · CLOUDINARY_API_SECRET</code>
            <p className={`flex items-start gap-2 text-xs font-semibold leading-relaxed ${settings.systemStatus?.cloudinary?.verified ? 'text-emerald-700' : 'text-amber-700'}`}>
              <i className={`fas ${settings.systemStatus?.cloudinary?.verified ? 'fa-circle-check' : 'fa-circle-exclamation'} mt-0.5`} aria-hidden />
              {settings.systemStatus?.cloudinary?.message || 'Status unknown — restart the server after setting environment variables.'}
            </p>
          </div>
        </Section>

        <Section title="SMTP & email delivery" description="Configure outgoing email and test the connection." icon="fa-envelope-open-text" className="xl:col-span-2">
          <Field label="SMTP host" name="host" value={settings.smtp.host} onChange={(name, value) => patch('smtp', name, value)} />
          <Field label="SMTP port" name="port" value={settings.smtp.port} onChange={(_, value) => patch('smtp', 'port', Number(value) || 587)} type="number" />
          <Field label="SMTP username" name="username" value={settings.smtp.username} onChange={(name, value) => patch('smtp', name, value)} />
          <div className="min-w-0">
            <label htmlFor="smtp-password" className="mb-1.5 block text-xs font-semibold text-slate-700">SMTP password</label>
            <input id="smtp-password" type="password" autoComplete="new-password" className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" placeholder={settings.smtp.hasPassword ? 'Saved securely — leave blank to keep' : 'Enter SMTP password'} value={smtpPassword} onChange={(event) => setSmtpPassword(event.target.value)} />
          </div>
          <div className="min-w-0">
            <label htmlFor="smtp-encryption" className="mb-1.5 block text-xs font-semibold text-slate-700">Encryption</label>
            <select id="smtp-encryption" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" value={settings.smtp.encryption} onChange={(event) => patch('smtp', 'encryption', event.target.value)}>
              <option value="None">None</option>
              <option value="TLS">TLS</option>
              <option value="SSL">SSL</option>
            </select>
          </div>
          <Field label="From email" name="fromEmail" value={settings.smtp.fromEmail} onChange={(name, value) => patch('smtp', name, value)} type="email" />
          <Field label="From name" name="fromName" value={settings.smtp.fromName} onChange={(name, value) => patch('smtp', name, value)} />
          <Field label="Reply-to email" name="replyTo" value={settings.smtp.replyTo} onChange={(name, value) => patch('smtp', name, value)} type="email" className="md:col-span-2" />
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 md:col-span-2">
            <Toggle label="Enable SMTP delivery" checked={settings.smtp.enabled} onChange={(value) => patch('smtp', 'enabled', value)} />
            <Toggle label="Send contact form notifications" checked={settings.smtp.enableContactForm} onChange={(value) => patch('smtp', 'enableContactForm', value)} />
            <Toggle label="Enable OTP email" checked={settings.smtp.enableOtp} onChange={(value) => patch('smtp', 'enableOtp', value)} />
            <Toggle label="Enable forgot-password email" checked={settings.smtp.enableForgotPassword} onChange={(value) => patch('smtp', 'enableForgotPassword', value)} />
            <Toggle label="Send welcome email" checked={settings.smtp.enableWelcome} onChange={(value) => patch('smtp', 'enableWelcome', value)} />
          </div>
          <div className="flex min-w-0 flex-col gap-3 md:col-span-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="smtp-test-email" className="mb-1.5 block text-xs font-semibold text-slate-700">Test recipient</label>
              <input id="smtp-test-email" type="email" className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" value={testEmail} onChange={(event) => setTestEmail(event.target.value)} placeholder={settings.contact.email} />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={saveSmtpOnly} className="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800">Save SMTP</button>
              <button type="button" onClick={testSmtp} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">Test connection</button>
            </div>
          </div>
          {smtpTestResult && (
            <div role="status" className={`flex items-start gap-2 rounded-xl p-3 text-sm font-medium md:col-span-2 ${smtpTestResult.startsWith('✓') ? 'bg-emerald-50 text-emerald-800' : smtpTestResult.startsWith('Testing') ? 'bg-slate-50 text-slate-600' : 'bg-rose-50 text-rose-800'}`}>
              <i className={`fas ${smtpTestResult.startsWith('✓') ? 'fa-circle-check' : smtpTestResult.startsWith('Testing') ? 'fa-spinner fa-spin' : 'fa-circle-exclamation'} mt-0.5`} aria-hidden />
              <span>{smtpTestResult}</span>
            </div>
          )}
        </Section>
      </div>

      <div className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="px-1 text-xs leading-relaxed text-slate-500">Save to apply changes to the public website and admin tools.</p>
        <button
          type="button"
          onClick={saveSettings}
          disabled={savingSettings}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
        >
          {savingSettings ? <i className="fas fa-spinner animate-spin" aria-hidden /> : <i className="fas fa-floppy-disk" aria-hidden />}
          {savingSettings ? 'Saving…' : 'Save all settings'}
        </button>
      </div>
    </div>
  );
};
