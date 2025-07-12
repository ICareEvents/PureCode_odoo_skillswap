'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  Download, 
  Ban, 
  CheckCircle, 
  XCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';
import { adminAPI } from '@/lib/api';
import { downloadFile, formatDate } from '@/lib/utils';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { showError, showSuccess } = useNotificationStore();
  
  const [users, setUsers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push('/');
    }
  }, [isAuthenticated, user, isLoading, router]);

  useEffect(() => {
    if (user?.is_admin) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [usersData, skillsData, swapsData] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getAllSkills(),
        adminAPI.getAllSwaps()
      ]);
      
      setUsers(usersData);
      setSkills(skillsData);
      setSwaps(swapsData);
    } catch (error: any) {
      showError('Failed to load admin data', error.message);
    }
  };

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const handleBanUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to ban ${userName}?`)) return;
    
    setLoading(`ban-${userId}`, true);
    try {
      await adminAPI.banUser(userId);
      showSuccess('User banned successfully');
      loadData();
    } catch (error: any) {
      showError('Failed to ban user', error.message);
    } finally {
      setLoading(`ban-${userId}`, false);
    }
  };

  const handleUnbanUser = async (userId: number, userName: string) => {
    setLoading(`unban-${userId}`, true);
    try {
      await adminAPI.unbanUser(userId);
      showSuccess('User unbanned successfully');
      loadData();
    } catch (error: any) {
      showError('Failed to unban user', error.message);
    } finally {
      setLoading(`unban-${userId}`, false);
    }
  };

  const handleApproveSkill = async (skillId: number, skillName: string) => {
    setLoading(`approve-${skillId}`, true);
    try {
      await adminAPI.approveSkill(skillId);
      showSuccess(`Skill "${skillName}" approved`);
      loadData();
    } catch (error: any) {
      showError('Failed to approve skill', error.message);
    } finally {
      setLoading(`approve-${skillId}`, false);
    }
  };

  const handleRejectSkill = async (skillId: number, skillName: string) => {
    if (!confirm(`Are you sure you want to reject "${skillName}"?`)) return;
    
    setLoading(`reject-${skillId}`, true);
    try {
      await adminAPI.rejectSkill(skillId);
      showSuccess(`Skill "${skillName}" rejected`);
      loadData();
    } catch (error: any) {
      showError('Failed to reject skill', error.message);
    } finally {
      setLoading(`reject-${skillId}`, false);
    }
  };

  const handleExportCSV = async () => {
    setLoading('export', true);
    try {
      const blob = await adminAPI.exportCSV();
      downloadFile(blob, `skillswap_stats_${new Date().toISOString().split('T')[0]}.csv`);
      showSuccess('CSV exported successfully');
    } catch (error: any) {
      showError('Failed to export CSV', error.message);
    } finally {
      setLoading('export', false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage users, skills, and platform content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center">
              <Users className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center">
              <BookOpen className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">{skills.length}</p>
                <p className="text-sm text-gray-600">Skills</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">{swaps.length}</p>
                <p className="text-sm text-gray-600">Swap Requests</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center">
              <Download className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <Button
                  onClick={handleExportCSV}
                  loading={loadingStates.export}
                  size="sm"
                  variant="outline"
                >
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="swaps">Swaps</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((userData) => (
                        <tr key={userData.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {userData.avatar_url ? (
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={userData.avatar_url}
                                    alt={userData.name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                      {userData.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {userData.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {userData.offered_skills?.length || 0} skills offered
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {userData.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={userData.is_banned ? 'danger' : 'success'}
                            >
                              {userData.is_banned ? 'Banned' : 'Active'}
                            </Badge>
                            {userData.is_admin && (
                              <Badge variant="info" className="ml-2">
                                Admin
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(userData.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {userData.id !== user.id && (
                              userData.is_banned ? (
                                <Button
                                  onClick={() => handleUnbanUser(userData.id, userData.name)}
                                  loading={loadingStates[`unban-${userData.id}`]}
                                  variant="outline"
                                  size="sm"
                                >
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Unban
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleBanUser(userData.id, userData.name)}
                                  loading={loadingStates[`ban-${userData.id}`]}
                                  variant="danger"
                                  size="sm"
                                >
                                  <UserX className="w-4 h-4 mr-1" />
                                  Ban
                                </Button>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skill Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Skill Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {skills.map((skill) => (
                        <tr key={skill.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {skill.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {skill.description || 'No description'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={skill.is_approved ? 'success' : 'warning'}
                            >
                              {skill.is_approved ? 'Approved' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(skill.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {!skill.is_approved && (
                              <Button
                                onClick={() => handleApproveSkill(skill.id, skill.name)}
                                loading={loadingStates[`approve-${skill.id}`]}
                                variant="outline"
                                size="sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            <Button
                              onClick={() => handleRejectSkill(skill.id, skill.name)}
                              loading={loadingStates[`reject-${skill.id}`]}
                              variant="danger"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="swaps">
            <Card>
              <CardHeader>
                <CardTitle>Swap Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requester
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Responder
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Skills Exchange
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {swaps.map((swap) => (
                        <tr key={swap.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {swap.requester_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {swap.responder_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {swap.offered_skill} ↔ {swap.wanted_skill}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                swap.status === 'pending' ? 'warning' :
                                swap.status === 'accepted' ? 'success' :
                                swap.status === 'completed' ? 'info' :
                                'default'
                              }
                            >
                              {swap.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(swap.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}