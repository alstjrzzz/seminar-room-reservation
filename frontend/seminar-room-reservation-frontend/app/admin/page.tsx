'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Download, Users, Calendar, Home, BookOpenText, CalendarCheck, CalendarClock, LogOut, CalendarX, Edit, Plus, Search } from 'lucide-react';
import { format, isBefore, isToday, isWithinInterval } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { adminAuth } from '@/utils/adminAuth';
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle, DialogFooter as UIDialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Reservation {
  reservationId: number;
  roomName?: string;
  nickname: string;
  studentName: string;
  studentId: string;
  phoneNumber: string;
  purpose: string;
  startTime: string;
  endTime: string;
}

interface AdminRoom {
  id: number;
  name: string;
  location: string;
  capacity: number;
  equipment: string;
  description: string;
  available: boolean;
}

type ReservationStatus = '예정됨' | '진행중' | '완료됨';

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [roomDeleteDialogOpen, setRoomDeleteDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeSection, setActiveSection] = useState<'reservation' | 'room'>('reservation');
  const [expandedNameIds, setExpandedNameIds] = useState<Set<number>>(new Set());
  const [expandedPurposeIds, setExpandedPurposeIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<AdminRoom | null>(null);
  const [roomForm, setRoomForm] = useState<Partial<AdminRoom>>({
    name: '',
    location: '',
    capacity: 0,
    equipment: '',
    description: '',
    available: true,
  });

  useEffect(() => {
    const isAuth = adminAuth.isAuthenticated();
    setIsAuthenticated(isAuth);
    
    if (!isAuth) {
      router.push('/');
      toast({
        variant: "destructive",
        title: "접근 제한",
        description: "관리자 인증이 필요합니다.",
      });
    } else {
      fetchReservations();
      fetchRooms();
    }
  }, []);

  const getReservationStatus = (startTime: string, endTime: string): ReservationStatus => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isBefore(now, start)) {
      return '예정됨';
    } else if (isWithinInterval(now, { start, end })) {
      return '진행중';
    } else {
      return '완료됨';
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case '예정됨':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case '진행중':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case '완료됨':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return '';
    }
  };

  const filterReservations = (reservations: Reservation[]) => {
    const now = new Date();

    let filtered: Reservation[];
    switch (activeTab) {
      case 'today':
        filtered = reservations.filter(res =>
          isToday(new Date(res.startTime)) ||
          isToday(new Date(res.endTime))
        );
        break;
      case 'scheduled':
        filtered = reservations.filter(res =>
          isBefore(now, new Date(res.startTime))
        );
        break;
      case 'completed':
        filtered = reservations.filter(res =>
          isBefore(new Date(res.endTime), now)
        );
        break;
      default:
        filtered = reservations;
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(res =>
        res.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.studentId.includes(searchTerm) ||
        res.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 시작 시간 기준으로 정렬
    return filtered.sort((a: Reservation, b: Reservation) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  };

  const fetchReservations = async () => {
    if (!adminAuth.isAuthenticated()) {
      router.push('/');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/reservation', { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });

      if (response.ok) {
        const data = await response.json();
        const mapped: Reservation[] = (data.reservations || []).map((r: any) => ({
          reservationId: Number(r.id),
          roomName: r.roomName,
          nickname: r.nickname,
          studentName: r.studentName,
          studentId: String(r.studentId),
          phoneNumber: r.phoneNumber,
          purpose: r.purpose,
          startTime: r.startTime,
          endTime: r.endTime,
        }));
        setReservations(mapped);
      } else {
        toast({
          variant: "destructive",
          title: "오류 발생",
          description: "예약 목록을 불러오는데 실패했습니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "서버와의 통신 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    if (!adminAuth.isAuthenticated()) {
      router.push('/');
      return;
    }
    try {
      const res = await fetch('/api/admin/room', { cache: 'no-store' });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setRooms((data.rooms || []).map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        location: r.location,
        capacity: Number(r.capacity),
        equipment: r.equipment,
        description: r.description,
        available: Boolean(r.available),
      })));
    } catch (e) {
      toast({ variant: 'destructive', title: '오류 발생', description: '방 목록을 불러오는데 실패했습니다.' });
    }
  };

  const handleDelete = async (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedReservationId == null || !adminAuth.isAuthenticated()) {
      router.push('/');
      return;
    }

    try {
      const response = await fetch('/api/admin/reservation', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...adminAuth.getAuthHeader?.(),
        },
        credentials: 'include',
        body: JSON.stringify({ reservationId: selectedReservationId }),
      });

      if (response.ok) {
        toast({
          title: "삭제 완료",
          description: "예약이 성공적으로 삭제되었습니다.",
        });
        fetchReservations();
      } else {
        toast({
          variant: "destructive",
          title: "삭제 실패",
          description: "예약 삭제 중 오류가 발생했습니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "서버와의 통신 중 오류가 발생했습니다.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedReservationId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  const openCreateRoom = () => {
    setEditingRoom(null);
    setRoomForm({ name: '', location: '', capacity: 0, equipment: '', description: '', available: true });
    setRoomModalOpen(true);
  };

  const openEditRoom = (room: AdminRoom) => {
    setEditingRoom(room);
    setRoomForm({ ...room });
    setRoomModalOpen(true);
  };

  const submitRoomForm = async () => {
    try {
      const method = editingRoom ? 'PATCH' : 'POST';
      const payload = editingRoom ? { id: editingRoom.id, ...roomForm, images: null } : { ...roomForm, images: null };
      const res = await fetch('/api/admin/room', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('failed');
      toast({ title: editingRoom ? '방 정보가 수정되었습니다.' : '방이 생성되었습니다.' });
      setRoomModalOpen(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (e) {
      toast({ variant: 'destructive', title: '오류 발생', description: editingRoom ? '방 수정에 실패했습니다.' : '방 생성에 실패했습니다.' });
    }
  };

  const handleRoomDelete = (room: AdminRoom) => {
    setSelectedRoomId(room.id);
    setSelectedRoomName(room.name);
    setRoomDeleteDialogOpen(true);
  };

  const confirmRoomDelete = async () => {
    if (selectedRoomId === null) return;

    try {
      const res = await fetch(`/api/admin/room/${selectedRoomId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('failed');
      toast({ title: '방이 삭제되었습니다.' });
      fetchRooms();
    } catch (e) {
      toast({ variant: 'destructive', title: '오류 발생', description: '방 삭제에 실패했습니다.' });
    } finally {
      setRoomDeleteDialogOpen(false);
      setSelectedRoomId(null);
      setSelectedRoomName('');
    }
  };

  const toggleNameExpanded = (reservationId: number) => {
    setExpandedNameIds((prev) => {
      const next = new Set(prev);
      if (next.has(reservationId)) {
        next.delete(reservationId);
      } else {
        next.add(reservationId);
      }
      return next;
    });
  };

  const togglePurposeExpanded = (reservationId: number) => {
    setExpandedPurposeIds((prev) => {
      const next = new Set(prev);
      if (next.has(reservationId)) {
        next.delete(reservationId);
      } else {
        next.add(reservationId);
      }
      return next;
    });
  };

  const handleExcelDownload = async () => {
    if (!adminAuth.isAuthenticated()) {
      router.push('/');
      return;
    }

    try {
      // 백엔드에서 직접 로그 파일 다운로드
      const response = await fetch('http://localhost:8080/api/admin/log', {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);
        const defaultFilename = `reservations_log_${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}.xlsx`;
        const filename = filenameMatch ? filenameMatch[1] : defaultFilename;

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "다운로드 완료",
          description: "예약 로그가 성공적으로 다운로드되었습니다.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "다운로드 실패",
          description: "로그 파일 다운로드 중 오류가 발생했습니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "서버와의 통신 중 오류가 발생했습니다.",
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const filteredReservations = filterReservations(reservations);
  const todayCount = reservations.filter(res => isToday(new Date(res.startTime))).length;
  const scheduledCount = reservations.filter(res => isBefore(new Date(), new Date(res.startTime))).length;
  const completedCount = reservations.filter(res => isBefore(new Date(res.endTime), new Date())).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">

              관리자 대시보드
            </h1>
            <p className="text-gray-600 mt-2">세미나실 예약 시스템 관리</p>
          </div>

          <div className="flex items-center gap-3">

              {activeSection === 'reservation' && (
                  <Button onClick={handleExcelDownload} className="bg-white hover:bg-gray-100 text-black shadow-sm">
                      <Download className="h-4 w-4 mr-2" />
                      로그 다운로드
                  </Button>
              )}
              {activeSection === 'room' && (
                  <Button onClick={openCreateRoom} className="bg-white hover:bg-gray-100 text-black shadow-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      방 생성
                  </Button>
              )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => activeSection === 'reservation' ? fetchReservations() : fetchRooms()}
              disabled={isLoading}
              className="bg-white shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`${isLoading ? 'animate-spin' : ''}`}
              >
                <path d="M21 12a9 9 0 0 1-9 9c-4.97 0-9-4.03-9-9s4.03-9 9-9h9" />
                <path d="M21 3v9h-9" />
              </svg>
            </Button>
              <div className="flex bg-white rounded-lg border shadow-sm p-1">
                  <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                          activeSection === 'reservation'
                              ? 'bg-black text-gray-100 shadow-sm'
                              : 'bg-white text-black hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveSection('reservation')}
                  >
                      <Calendar className="h-4 w-4" />
                      예약관리
                  </button>
                  <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                          activeSection === 'room'
                              ? 'bg-black text-gray-100 shadow-sm'
                              : 'bg-white text-black hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveSection('room')}
                  >
                      <Home className="h-4 w-4" />
                      방관리
                  </button>
              </div>
          </div>
        </div>

      {activeSection === 'reservation' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">전체 예약</p>
                    <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-gray-900" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">오늘 예약</p>
                    <p className="text-2xl font-bold text-gray-900">{todayCount}</p>
                  </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <CalendarCheck className="h-6 w-6 text-gray-900" />
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">예정된 예약</p>
                    <p className="text-2xl font-bold text-gray-900">{scheduledCount}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <CalendarClock className="h-6 w-6 text-gray-900" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">완료된 예약</p>
                    <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <CalendarX className="h-6 w-6 text-gray-900" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-xl font-semibold text-gray-900">예약 관리</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="예약자, 학번, 방 이름으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 pb-4">
                  <TabsList className="bg-gray-100">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white">전체 예약</TabsTrigger>
                    <TabsTrigger value="today" className="data-[state=active]:bg-white">오늘</TabsTrigger>
                    <TabsTrigger value="scheduled" className="data-[state=active]:bg-white">예정된 예약</TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-white">지난 예약</TabsTrigger>
                  </TabsList>
                </div>

                <div className="overflow-x-auto border-t">
                  <Table className="table-fixed w-full">
                    <TableHeader className="sticky top-0 bg-gray-50">
                      <TableRow className="border-b">
                        <TableHead className="w-[140px] whitespace-nowrap font-semibold text-gray-900">방</TableHead>
                        <TableHead className="w-[120px] whitespace-nowrap font-semibold text-gray-900">예약자</TableHead>
                        <TableHead className="w-[100px] whitespace-nowrap font-semibold text-gray-900">학번</TableHead>
                        <TableHead className="w-[120px] whitespace-nowrap font-semibold text-gray-900">연락처</TableHead>
                        <TableHead className="w-[220px] whitespace-nowrap font-semibold text-gray-900">목적</TableHead>
                        <TableHead className="w-[150px] whitespace-nowrap font-semibold text-gray-900">시작 시간</TableHead>
                        <TableHead className="w-[150px] whitespace-nowrap font-semibold text-gray-900">종료 시간</TableHead>
                        <TableHead className="w-[100px] whitespace-nowrap font-semibold text-gray-900">상태</TableHead>
                        <TableHead className="w-[80px] whitespace-nowrap font-semibold text-gray-900">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReservations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <Calendar className="h-8 w-8 text-gray-300" />
                              <p>검색 결과가 없습니다</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReservations.map((reservation) => {
                          const status = getReservationStatus(reservation.startTime, reservation.endTime);
                          return (
                            <TableRow key={reservation.reservationId} className="hover:bg-gray-50 transition-colors">
                              <TableCell className="whitespace-nowrap font-medium">{reservation.roomName || '-'}</TableCell>
                              <TableCell
                                className={(expandedNameIds.has(reservation.reservationId)
                                  ? 'whitespace-normal break-words'
                                  : 'max-w-[150px] truncate cursor-pointer')}
                                onClick={() => toggleNameExpanded(reservation.reservationId)}
                                title={reservation.nickname}
                              >
                                {reservation.nickname}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-gray-600">{reservation.studentId}</TableCell>
                              <TableCell className="whitespace-nowrap text-gray-600">{reservation.phoneNumber}</TableCell>
                              <TableCell
                                className={(expandedPurposeIds.has(reservation.reservationId)
                                  ? 'whitespace-normal break-words w-[220px]'
                                  : 'w-[220px] truncate cursor-pointer')}
                                onClick={() => togglePurposeExpanded(reservation.reservationId)}
                                title={reservation.purpose}
                              >
                                {reservation.purpose}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-gray-600 text-sm">{formatDateTime(reservation.startTime)}</TableCell>
                              <TableCell className="whitespace-nowrap text-gray-600 text-sm">{formatDateTime(reservation.endTime)}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge
                                  variant={status === '진행중' ? 'default' : status === '예정됨' ? 'secondary' : 'outline'}
                                  className={`inline-block min-w-[60px] text-center font-medium ${getStatusColor(status)}`}
                                >
                                  {status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(reservation.reservationId)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {activeSection === 'room' && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Home className="h-5 w-5" />
              세미나실 관리
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto border-t">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50">
                  <TableRow className="border-b">
                    <TableHead className="w-[80px] whitespace-nowrap font-semibold text-gray-900">ID</TableHead>
                    <TableHead className="w-[140px] whitespace-nowrap font-semibold text-gray-900">이름</TableHead>
                    <TableHead className="w-[200px] whitespace-nowrap font-semibold text-gray-900">위치</TableHead>
                    <TableHead className="w-[80px] whitespace-nowrap font-semibold text-gray-900">수용인원</TableHead>
                    <TableHead className="w-[240px] whitespace-nowrap font-semibold text-gray-900">장비</TableHead>
                    <TableHead className="w-[240px] whitespace-nowrap font-semibold text-gray-900">설명</TableHead>
                    <TableHead className="w-[80px] whitespace-nowrap font-semibold text-gray-900">사용가능</TableHead>
                    <TableHead className="w-[160px] whitespace-nowrap font-semibold text-gray-900">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Home className="h-8 w-8 text-gray-300" />
                          <p>등록된 세미나실이 없습니다</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rooms.map((room) => (
                      <TableRow key={room.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="whitespace-nowrap font-medium text-gray-900">{room.id}</TableCell>
                        <TableCell className="whitespace-nowrap font-medium">{room.name}</TableCell>
                        <TableCell className="truncate max-w-[220px] text-gray-600" title={room.location}>{room.location}</TableCell>
                        <TableCell className="whitespace-nowrap text-gray-600">{room.capacity}명</TableCell>
                        <TableCell className="truncate max-w-[260px] text-gray-600" title={room.equipment}>{room.equipment}</TableCell>
                        <TableCell className="truncate max-w-[260px] text-gray-600" title={room.description}>{room.description}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant={room.available ? 'default' : 'secondary'}
                            className={room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {room.available ? '사용가능' : '사용불가'}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditRoom(room)}
                              className="hover:bg-blue-50 hover:border-blue-200"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              수정
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRoomDelete(room)}
                              className="text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              삭제
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 예약을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={roomDeleteDialogOpen} onOpenChange={setRoomDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>방 삭제({selectedRoomName})</AlertDialogTitle>
            <AlertDialogDescription>
                <p>이 작업은 되돌릴 수 없으며 선택한 세미나실과 관련된 모든 예약 정보도 함께 삭제됩니다.</p>
                <p>예약 가능 여부 체크를 해제하여 사용자에게 노출되지 않게 하는 것을 추천합니다.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoomDeleteDialogOpen(false)}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoomDelete} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UIDialog open={roomModalOpen} onOpenChange={setRoomModalOpen}>
        <UIDialogContent className="sm:max-w-[520px]">
          <UIDialogHeader>
            <UIDialogTitle>{editingRoom ? '방 정보 수정' : '방 생성'}</UIDialogTitle>
          </UIDialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <label className="text-sm">이름</label>
              <Input value={roomForm.name || ''} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">위치</label>
              <Input value={roomForm.location || ''} onChange={(e) => setRoomForm({ ...roomForm, location: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">수용 인원</label>
              <Input type="number" value={roomForm.capacity ?? 0} onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">장비</label>
              <Input value={roomForm.equipment || ''} onChange={(e) => setRoomForm({ ...roomForm, equipment: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">설명</label>
              <Input value={roomForm.description || ''} onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="available" checked={!!roomForm.available} onCheckedChange={(v) => setRoomForm({ ...roomForm, available: Boolean(v) })} />
              <label htmlFor="available" className="text-sm">사용 가능</label>
            </div>
          </div>
          <UIDialogFooter>
            <Button onClick={submitRoomForm}>{editingRoom ? '수정' : '생성'}</Button>
          </UIDialogFooter>
        </UIDialogContent>
      </UIDialog>
      </div>
    </div>
  );
} 