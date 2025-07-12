'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, User, FileText, Globe, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSkills } from '@/hooks/useApi';
import { useNotificationStore } from '@/store/notificationStore';
import { userAPI } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  is_public: z.boolean(),
  availability: z.enum(['available', 'busy', 'unavailable']),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface SkillSelectorProps {
  label: string;
  selectedSkills: any[];
  onSkillsChange: (skills: any[]) => void;
  availableSkills: any[];
}

const SkillSelector: React.FC<SkillSelectorProps> = ({
  label,
  selectedSkills,
  onSkillsChange,
  availableSkills
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSkills.some(selected => selected.id === skill.id)
  );

  const addSkill = (skill: any) => {
    onSkillsChange([...selectedSkills, skill]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const removeSkill = (skillId: number) => {
    onSkillsChange(selectedSkills.filter(skill => skill.id !== skillId));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSkills.map(skill => (
            <Badge
              key={skill.id}
              variant="primary"
              className="cursor-pointer"
              onClick={() => removeSkill(skill.id)}
            >
              {skill.name} ×
            </Badge>
          ))}
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search and add skills..."
            className="input-field"
          />
          
          {isOpen && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredSkills.length > 0 ? (
                filteredSkills.slice(0, 5).map(skill => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    {skill.name}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500">
                  No skills found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {isOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const ProfileForm: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { data: skillsData } = useSkills();
  const { showError, showSuccess } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [offeredSkills, setOfferedSkills] = useState(user?.offered_skills || []);
  const [wantedSkills, setWantedSkills] = useState(user?.wanted_skills || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      is_public: user?.is_public ?? true,
      availability: user?.availability as any || 'available',
    },
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('File too large', 'Please select an image smaller than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Invalid file type', 'Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const result = await userAPI.uploadAvatar(file);
      if (user) {
        updateUser({ ...user, avatar_url: result.avatar_url });
      }
      showSuccess('Avatar updated successfully');
    } catch (error: any) {
      showError('Failed to upload avatar', error.message);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updateData = {
        ...data,
        offered_skill_ids: offeredSkills.map(skill => skill.id),
        wanted_skill_ids: wantedSkills.map(skill => skill.id),
      };

      const updatedUser = await userAPI.updateMe(updateData);
      updateUser(updatedUser);
      showSuccess('Profile updated successfully');
    } catch (error: any) {
      showError('Failed to update profile', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {avatarPreview || user.avatar_url ? (
                  <img
                    src={avatarPreview || user.avatar_url!}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {getInitials(user.name)}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-sm text-gray-500">
                Click the camera icon to upload a new avatar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  {...register('name')}
                  label="Full Name"
                  placeholder="Enter your full name"
                  error={errors.name?.message}
                  leftIcon={<User />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <select
                  {...register('availability')}
                  className="input-field"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                placeholder="Tell others about yourself and what you're passionate about..."
                className="input-field resize-none"
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('is_public')}
                id="is_public"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="flex items-center text-sm text-gray-700">
                <Globe className="w-4 h-4 mr-2" />
                Make my profile public
              </label>
            </div>

            {skillsData && (
              <>
                <SkillSelector
                  label="Skills I Can Offer"
                  selectedSkills={offeredSkills}
                  onSkillsChange={setOfferedSkills}
                  availableSkills={skillsData}
                />

                <SkillSelector
                  label="Skills I Want to Learn"
                  selectedSkills={wantedSkills}
                  onSkillsChange={setWantedSkills}
                  availableSkills={skillsData}
                />
              </>
            )}

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;