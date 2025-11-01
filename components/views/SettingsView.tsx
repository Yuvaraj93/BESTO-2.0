import React from 'react';
import Modal from '../Modal';

interface SettingsViewProps {
    voiceFeedback: boolean;
    setVoiceFeedback: (enabled: boolean) => void;
}

const SettingItem: React.FC<{title: string, description: string}> = ({title, description}) => (
    <div className="py-4">
        <h3 className="font-semibold text-md text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
    </div>
);

const Toggle: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void; description: string;}> = ({ label, enabled, onChange, description }) => (
    <div className="flex justify-between items-center py-4">
        <div>
            <h3 className="font-semibold text-md text-slate-800">{label}</h3>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </div>
);


const SettingsView: React.FC<SettingsViewProps> = ({ voiceFeedback, setVoiceFeedback }) => {
    const [smartNotifications, setSmartNotifications] = React.useState(true);

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Settings</h2>

            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Account</h3>
                    <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200 px-4">
                        <SettingItem title="Connect to Supabase" description="Sync your data across devices" />
                        <SettingItem title="Upgrade Plan" description="Get more AI tokens and premium features" />
                        <SettingItem title="Connect Google Calendar" description="Sync events with your Google Calendar" />
                    </div>
                </div>

                 <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Preferences</h3>
                     <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200 px-4">
                       <Toggle 
                            label="Voice Feedback"
                            description="Hear confirmation after capturing"
                            enabled={voiceFeedback}
                            onChange={setVoiceFeedback}
                       />
                       <Toggle 
                            label="Smart Notifications"
                            description="Get reminders for due tasks"
                            enabled={smartNotifications}
                            onChange={setSmartNotifications}
                       />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;