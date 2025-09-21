import React, { useState, useRef } from 'react';
import type { UserSettings, HistoryEntry, PurchaseLog, PlayerStats } from '../types';
import { UserIcon, LockClosedIcon, SunIcon, MoonIcon, ArrowDownOnSquareIcon, TrashIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowUpTrayIcon, SparklesIcon } from './Icons';
import { GenerateAvatarModal } from './GenerateAvatarModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { soundService } from '../services/soundService';

// Fix for module augmentation issue with 'jspdf' by using a type intersection.
// This ensures all methods from jsPDF are inherited correctly and adds autoTable plugin's types.
type jsPDFWithAutoTable = jsPDF & {
    autoTable: (options: any) => jsPDFWithAutoTable;
    readonly lastAutoTable: { finalY: number };
};

type FullUserData = {
    username: string;
    data: {
      history: HistoryEntry[];
      purchaseLogs: PurchaseLog[];
      playerStats: PlayerStats;
      settings: UserSettings;
    }
};

interface ProfileProps {
    username: string;
    settings: UserSettings;
    onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
    onChangePassword: (newPassword: string) => Promise<void>;
    onDeleteAccount: () => void;
    onExportData: () => FullUserData;
}

export const Profile: React.FC<ProfileProps> = ({
    username,
    settings,
    onUpdateSettings,
    onChangePassword,
    onDeleteAccount,
    onExportData,
}) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        soundService.play('click');
        setPasswordError(null);
        setPasswordSuccess(null);

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters long.");
            soundService.play('error');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            soundService.play('error');
            return;
        }
        
        try {
            await onChangePassword(newPassword);
            soundService.play('success');
            setPasswordSuccess("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            soundService.play('error');
            setPasswordError("Failed to update password.");
        }
    };
    
    const handleThemeToggle = () => {
        soundService.play('click');
        onUpdateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
    };
    
    const handleSoundToggle = () => {
        // Play sound before state changes, ensuring it's heard before potentially being muted
        soundService.play('click');
        onUpdateSettings({ isSoundEnabled: !settings.isSoundEnabled });
    };
    
    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("Image size exceeds 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateSettings({ profilePicture: reader.result as string });
                soundService.play('success');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAvatar = (base64Image: string) => {
        onUpdateSettings({ profilePicture: base64Image });
        setIsAvatarModalOpen(false);
        soundService.play('success');
    };

    const handleExportPdf = () => {
        soundService.play('click');
        const userData = onExportData();
        // Cast to custom interface to include autoTable method
        const doc = new jsPDF() as jsPDFWithAutoTable;

        // Title and Header
        doc.setFontSize(22);
        doc.text("AgriGuard Data Report", 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Report for user: ${userData.username}`, 105, 30, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 35, { align: 'center' });

        // Player Stats Section
        doc.setFontSize(16);
        doc.text("Player Statistics", 14, 50);
        doc.autoTable({
            startY: 55,
            body: [
                ['Rank', userData.data.playerStats.levelName],
                ['Level', userData.data.playerStats.level.toString()],
                ['Total Score', userData.data.playerStats.score.toString()],
                ['Plants Scanned', userData.data.playerStats.scans.toString()],
            ],
            theme: 'grid',
            columnStyles: { 0: { fontStyle: 'bold' } },
        });

        let finalY = doc.lastAutoTable.finalY || 80;

        // Scan History Table
        if (userData.data.history.length > 0) {
            doc.setFontSize(16);
            doc.text("Scan History", 14, finalY + 15);
            doc.autoTable({
                startY: finalY + 20,
                head: [['Date', 'Pest Detected', 'Infection %', 'Recommendation']],
                body: userData.data.history.map((entry) => [
                    new Date(entry.date).toLocaleDateString(),
                    entry.result.pestName,
                    entry.result.infectionLevel,
                    entry.result.recommendation,
                ]),
                theme: 'striped',
                headStyles: { fillColor: [34, 197, 94] }, // Primary color
            });
            finalY = doc.lastAutoTable.finalY;
        }

        // Purchase Logs Table
        if (userData.data.purchaseLogs.length > 0) {
            doc.setFontSize(16);
            doc.text("Purchase Logs", 14, finalY + 15);
            doc.autoTable({
                startY: finalY + 20,
                head: [['Date', 'Item', 'Quantity', 'Unit', 'Cost ($)']],
                body: userData.data.purchaseLogs.map((log) => [
                    new Date(log.date).toLocaleDateString(),
                    log.pesticideName,
                    log.quantity,
                    log.unit,
                    log.cost.toFixed(2),
                ]),
                theme: 'striped',
                headStyles: { fillColor: [161, 98, 7] }, // Secondary color
            });
        }

        doc.save(`agriGuard_report_${userData.username}.pdf`);
    };
    
    const handleDelete = () => {
        soundService.play('click');
        if (window.confirm(`Are you absolutely sure you want to delete your account, ${username}? This action is irreversible and all your data will be lost.`)) {
            soundService.play('delete');
            onDeleteAccount();
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold text-text-primary">Profile & Settings</h2>
                <p className="mt-2 text-lg text-text-secondary">Manage your account and application preferences.</p>
            </div>

            {/* Account Info */}
            <div className="bg-surface rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Account Information</h3>
                 <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative w-24 h-24">
                        {settings.profilePicture ? (
                            <img src={settings.profilePicture} alt="Profile Avatar" className="w-full h-full rounded-full object-cover shadow-md" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center border-2 border-dashed">
                                <UserIcon className="w-12 h-12 text-text-secondary" />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Username</p>
                        <p className="text-xl font-medium text-text-primary">{username}</p>
                        <div className="mt-2 flex gap-2">
                             <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/png, image/jpeg" className="hidden" />
                             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md font-semibold">
                                 <ArrowUpTrayIcon className="w-4 h-4" /> Upload
                             </button>
                             <button onClick={() => setIsAvatarModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md font-semibold">
                                 <SparklesIcon className="w-4 h-4 text-primary" /> Generate
                             </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Change Password */}
            <div className="bg-surface rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                           className="w-full px-4 py-2 bg-background border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                        <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                           className="w-full px-4 py-2 bg-background border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                           className="w-full px-4 py-2 bg-background border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                    {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                    {passwordSuccess && <p className="text-sm text-green-500">{passwordSuccess}</p>}
                    <div className="text-right">
                        <button type="submit" className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
            
            {/* App Settings */}
            <div className="bg-surface rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Application Settings</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-text-primary">Theme</p>
                        <button onClick={handleThemeToggle} className="flex items-center gap-2 px-4 py-2 rounded-full bg-background hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                           {settings.theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5 text-yellow-400" />}
                           <span className="font-semibold">{settings.theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                        </button>
                    </div>
                     <div className="flex items-center justify-between">
                        <p className="text-text-primary">Sound Effects</p>
                        <button onClick={handleSoundToggle} className="flex items-center justify-center gap-2 w-28 px-4 py-2 rounded-full bg-background hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                            {settings.isSoundEnabled ? (
                                <>
                                    <SpeakerWaveIcon className="w-5 h-5 text-primary" />
                                    <span className="font-semibold">On</span>
                                </>
                            ) : (
                                <>
                                    <SpeakerXMarkIcon className="w-5 h-5 text-text-secondary" />
                                    <span className="font-semibold">Off</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-surface rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Data Management</h3>
                 <div className="flex flex-col sm:flex-row gap-4">
                     <button onClick={handleExportPdf} className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
                        <ArrowDownOnSquareIcon className="w-5 h-5" />
                        Download PDF Report
                    </button>
                    <button onClick={handleDelete} className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
                        <TrashIcon className="w-5 h-5" />
                        Delete Account
                    </button>
                 </div>
            </div>

             {isAvatarModalOpen && (
                <GenerateAvatarModal
                    onClose={() => setIsAvatarModalOpen(false)}
                    onSaveAvatar={handleSaveAvatar}
                />
            )}
        </div>
    );
};