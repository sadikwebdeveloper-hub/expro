import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { AppSettings } from '../../types';

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label,
  checked,
  onChange,
}) => (
  <label className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5" />
  </label>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="md:col-span-2 mt-6">
    <h3 className="font-bold text-gray-400 border-b pb-2 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
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
  <div className={className}>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      className="w-full border p-2 rounded"
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(name, e.target.value)}
    />
  </div>
);

export const ManageSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [smtpTestResult, setSmtpTestResult] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [editEmail, setEditEmail] = useState<{ old: string; value: string } | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    backend.getSettings().then(setSettings).catch(() => setErr('Failed to load settings'));
  }, []);

  const showMsg = (text: string, isError = false) => {
    if (isError) {
      setErr(text);
      setMsg('');
    } else {
      setMsg(text);
      setErr('');
    }
    setTimeout(() => {
      setMsg('');
      setErr('');
    }, 4000);
  };

  const patch = (section: keyof AppSettings, name: string, value: string | boolean | number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: { ...settings[section], [name]: value },
    });
  };

  const saveSettings = async () => {
    if (!settings) return;
    try {
      const updated = await backend.updateSettings(settings, smtpPassword || undefined);
      setSettings(updated);
      setSmtpPassword('');
      showMsg('Settings saved successfully!');
    } catch (e: any) {
      showMsg(e.message || 'Save failed', true);
    }
  };

  const saveSmtpOnly = async () => {
    if (!settings) return;
    try {
      const updated = await backend.updateSettings({ smtp: settings.smtp }, smtpPassword || undefined);
      setSettings({ ...settings, smtp: updated.smtp });
      setSmtpPassword('');
      showMsg('SMTP settings saved!');
    } catch (e: any) {
      showMsg(e.message || 'SMTP save failed', true);
    }
  };

  const testSmtp = async () => {
    if (!settings) return;
    setSmtpTestResult('Testing...');
    try {
      const result = await backend.testSmtp(
        testEmail || settings.contact.email,
        settings.smtp,
        smtpPassword || undefined
      );
      setSmtpTestResult(result.success ? '✓ SMTP Connected Successfully' : `❌ ${result.message}`);
    } catch (e: any) {
      setSmtpTestResult(`❌ SMTP Authentication Failed - ${e.message}`);
    }
  };

  const addEmail = async () => {
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    try {
      const emails = await backend.addContactEmail(newEmail.trim());
      setSettings((s) => s && ({ ...s, contact: { ...s.contact, notificationEmails: emails } }));
      setNewEmail('');
      showMsg('Email added');
    } catch (e: any) {
      showMsg(e.message, true);
    } finally {
      setSavingEmail(false);
    }
  };

  const removeEmail = async (email: string) => {
    try {
      const emails = await backend.removeContactEmail(email);
      setSettings((s) => s && ({ ...s, contact: { ...s.contact, notificationEmails: emails } }));
      showMsg('Email removed');
    } catch (e: any) {
      showMsg(e.message, true);
    }
  };

  const saveEditEmail = async () => {
    if (!editEmail) return;
    try {
      const emails = await backend.updateContactEmail(editEmail.old, editEmail.value);
      setSettings((s) => s && ({ ...s, contact: { ...s.contact, notificationEmails: emails } }));
      setEditEmail(null);
      showMsg('Email updated');
    } catch (e: any) {
      showMsg(e.message, true);
    }
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    try {
      const result = await backend.uploadLogo(file);
      setSettings({ ...settings, branding: { ...settings.branding, logoUrl: result.logoUrl } });
      showMsg('Logo uploaded');
    } catch (err: any) {
      showMsg(err.message, true);
    }
  };

  const uploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    try {
      const result = await backend.uploadFavicon(file);
      setSettings({ ...settings, branding: { ...settings.branding, faviconUrl: result.faviconUrl } });
      showMsg('Favicon uploaded');
    } catch (err: any) {
      showMsg(err.message, true);
    }
  };

  if (!settings) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">Global Site Settings</h2>
      {msg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{msg}</div>}
      {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="General">
          <Field label="Website Name" name="websiteName" value={settings.general.websiteName} onChange={(n, v) => patch('general', n, v)} />
          <Field label="Timezone" name="timezone" value={settings.general.timezone} onChange={(n, v) => patch('general', n, v)} />
          <Field label="Currency" name="currency" value={settings.general.currency} onChange={(n, v) => patch('general', n, v)} />
          <Field label="Language" name="language" value={settings.general.language} onChange={(n, v) => patch('general', n, v)} />
          <div className="md:col-span-2">
            <Toggle label="Maintenance Mode" checked={settings.general.maintenanceMode} onChange={(v) => patch('general', 'maintenanceMode', v)} />
            <Field label="Maintenance Message" name="maintenanceMessage" value={settings.general.maintenanceMessage} onChange={(n, v) => patch('general', n, v)} className="mt-2" />
          </div>
        </Section>

        <Section title="Branding">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Website Logo</label>
            {settings.branding.logoUrl && <img src={settings.branding.logoUrl} alt="Logo" className="h-16 mb-2 object-contain" />}
            <input type="file" accept="image/*" onChange={uploadLogo} className="w-full text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Favicon</label>
            {settings.branding.faviconUrl && <img src={settings.branding.faviconUrl} alt="Favicon" className="h-8 mb-2 object-contain" />}
            <input type="file" accept="image/*" onChange={uploadFavicon} className="w-full text-sm" />
          </div>
          <Field label="Logo URL (fallback)" name="logoUrl" value={settings.branding.logoUrl} onChange={(_, v) => setSettings({ ...settings, branding: { ...settings.branding, logoUrl: v } })} className="md:col-span-2" />
        </Section>

        <Section title="Contact Info">
          <Field label="Phone" name="phone" value={settings.contact.phone} onChange={(n, v) => patch('contact', n, v)} />
          <Field label="Email" name="email" value={settings.contact.email} onChange={(n, v) => patch('contact', n, v)} />
          <Field label="Support Email" name="supportEmail" value={settings.contact.supportEmail} onChange={(n, v) => patch('contact', n, v)} />
          <Field label="Office Address" name="address" value={settings.contact.address} onChange={(n, v) => patch('contact', n, v)} className="md:col-span-2" />
          <Field label="Google Map Embed URL" name="mapUrl" value={settings.contact.mapUrl} onChange={(n, v) => patch('contact', n, v)} className="md:col-span-2" />
        </Section>

        <Section title="Contact Form Notification Emails">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Receive Contact Form Emails</label>
            <div className="flex gap-2 mb-3">
              <input className="border p-2 rounded flex-grow" placeholder="admin@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <button type="button" onClick={addEmail} disabled={savingEmail} className="bg-blue-600 text-white px-4 rounded">Add</button>
            </div>
            <div className="space-y-2">
              {settings.contact.notificationEmails?.map((email) => (
                <div key={email} className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                  {editEmail?.old === email ? (
                    <>
                      <input className="border p-1 rounded flex-grow text-sm" value={editEmail.value} onChange={(e) => setEditEmail({ ...editEmail, value: e.target.value })} />
                      <button type="button" onClick={saveEditEmail} className="text-green-600 text-sm font-bold">Save</button>
                      <button type="button" onClick={() => setEditEmail(null)} className="text-gray-500 text-sm">Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="flex-grow text-sm text-blue-900">{email}</span>
                      <button type="button" onClick={() => setEditEmail({ old: email, value: email })} className="text-blue-600 text-sm">Edit</button>
                      <button type="button" onClick={() => removeEmail(email)} className="text-red-500 text-sm"><i className="fas fa-times" /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Social Links">
          <Field label="Facebook" name="facebook" value={settings.social.facebook} onChange={(n, v) => patch('social', n, v)} />
          <Field label="Instagram" name="instagram" value={settings.social.instagram} onChange={(n, v) => patch('social', n, v)} />
          <Field label="LinkedIn" name="linkedin" value={settings.social.linkedin} onChange={(n, v) => patch('social', n, v)} />
          <Field label="Twitter / X" name="twitter" value={settings.social.twitter} onChange={(n, v) => patch('social', n, v)} />
          <Field label="YouTube" name="youtube" value={settings.social.youtube} onChange={(n, v) => patch('social', n, v)} />
          <Field label="WhatsApp" name="whatsapp" value={settings.social.whatsapp} onChange={(n, v) => patch('social', n, v)} />
          <Field label="Telegram" name="telegram" value={settings.social.telegram} onChange={(n, v) => patch('social', n, v)} />
          <Field label="Messenger" name="messenger" value={settings.social.messenger} onChange={(n, v) => patch('social', n, v)} />
        </Section>

        <Section title="SEO & Analytics">
          <Field label="Meta Title" name="metaTitle" value={settings.seo.metaTitle} onChange={(n, v) => patch('seo', n, v)} className="md:col-span-2" />
          <Field label="Meta Description" name="metaDescription" value={settings.seo.metaDescription} onChange={(n, v) => patch('seo', n, v)} className="md:col-span-2" />
          <Field label="Keywords" name="keywords" value={settings.seo.keywords} onChange={(n, v) => patch('seo', n, v)} className="md:col-span-2" />
          <Field label="Google Analytics ID" name="googleAnalyticsId" value={settings.seo.googleAnalyticsId} onChange={(n, v) => patch('seo', n, v)} />
          <Field label="Facebook Pixel ID" name="facebookPixelId" value={settings.seo.facebookPixelId} onChange={(n, v) => patch('seo', n, v)} />
        </Section>

        <Section title="Footer">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Footer Copyright</label>
            <textarea className="w-full border p-2 rounded" rows={3} value={settings.footer.copyright} onChange={(e) => patch('footer', 'copyright', e.target.value)} />
          </div>
        </Section>

        <Section title="SMTP Settings">
          <Field label="SMTP Host" name="host" value={settings.smtp.host} onChange={(n, v) => patch('smtp', n, v)} />
          <Field label="SMTP Port" name="port" value={settings.smtp.port} onChange={(n, v) => patch('smtp', 'port', Number(v) || 587)} type="number" />
          <Field label="SMTP Username" name="username" value={settings.smtp.username} onChange={(n, v) => patch('smtp', n, v)} />
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">SMTP Password</label>
            <input type="password" className="w-full border p-2 rounded" placeholder={settings.smtp.hasPassword ? '•••••••• (leave blank to keep)' : 'Enter SMTP password'} value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Encryption</label>
            <select className="w-full border p-2 rounded" value={settings.smtp.encryption} onChange={(e) => patch('smtp', 'encryption', e.target.value)}>
              <option value="None">None</option>
              <option value="TLS">TLS</option>
              <option value="SSL">SSL</option>
            </select>
          </div>
          <Field label="From Email" name="fromEmail" value={settings.smtp.fromEmail} onChange={(n, v) => patch('smtp', n, v)} />
          <Field label="From Name" name="fromName" value={settings.smtp.fromName} onChange={(n, v) => patch('smtp', n, v)} />
          <Field label="Reply-To Email" name="replyTo" value={settings.smtp.replyTo} onChange={(n, v) => patch('smtp', n, v)} className="md:col-span-2" />
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <Toggle label="Enable SMTP" checked={settings.smtp.enabled} onChange={(v) => patch('smtp', 'enabled', v)} />
            <Toggle label="Enable Contact Form Email" checked={settings.smtp.enableContactForm} onChange={(v) => patch('smtp', 'enableContactForm', v)} />
            <Toggle label="Enable OTP Email" checked={settings.smtp.enableOtp} onChange={(v) => patch('smtp', 'enableOtp', v)} />
            <Toggle label="Enable Forgot Password Email" checked={settings.smtp.enableForgotPassword} onChange={(v) => patch('smtp', 'enableForgotPassword', v)} />
            <Toggle label="Enable Welcome Email" checked={settings.smtp.enableWelcome} onChange={(v) => patch('smtp', 'enableWelcome', v)} />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-3 items-end">
            <div className="flex-grow">
              <label className="block text-sm font-bold text-gray-700 mb-2">Test Email Address</label>
              <input className="w-full border p-2 rounded" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder={settings.contact.email} />
            </div>
            <button type="button" onClick={saveSmtpOnly} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Save SMTP Settings</button>
            <button type="button" onClick={testSmtp} className="bg-gray-800 text-white px-4 py-2 rounded font-bold">Test SMTP Connection</button>
          </div>
          {smtpTestResult && (
            <div className={`md:col-span-2 p-3 rounded text-sm font-bold ${smtpTestResult.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {smtpTestResult}
            </div>
          )}
        </Section>
      </div>

      <button onClick={saveSettings} className="mt-8 bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">
        Save All Settings
      </button>
    </div>
  );
};
