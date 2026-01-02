import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Button,
    Input,
    Label,
    Textarea,
    Switch,
} from '@/components/common';
import type { HolidayListItem, CreateHolidayRequest, UpdateHolidayRequest } from '@/services/holidays/types';

const holidaySchema = z.object({
    date: z.string().min(1, 'Tanggal wajib diisi'),
    name: z.string().min(1, 'Nama hari libur wajib diisi').max(255, 'Nama maksimal 255 karakter'),
    description: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
});

type HolidayFormData = z.infer<typeof holidaySchema>;

interface HolidayFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    holiday: HolidayListItem | null;
    onSubmit: (data: CreateHolidayRequest | UpdateHolidayRequest) => void;
    isLoading?: boolean;
}

const HolidayFormDialog: React.FC<HolidayFormDialogProps> = ({
    open,
    onOpenChange,
    holiday,
    onSubmit,
    isLoading,
}) => {
    const isEditing = !!holiday;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<HolidayFormData>({
        resolver: zodResolver(holidaySchema),
        defaultValues: {
            date: '',
            name: '',
            description: '',
            is_active: true,
        },
    });

    const isActiveValue = watch('is_active');

    useEffect(() => {
        if (open) {
            if (holiday) {
                reset({
                    date: holiday.date,
                    name: holiday.name,
                    description: '',
                    is_active: holiday.is_active,
                });
            } else {
                reset({
                    date: '',
                    name: '',
                    description: '',
                    is_active: true,
                });
            }
        }
    }, [open, holiday, reset]);

    const onFormSubmit = (data: HolidayFormData) => {
        onSubmit({
            date: data.date,
            name: data.name,
            description: data.description || null,
            ...(isEditing && { is_active: data.is_active }),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Ubah informasi hari libur yang sudah ada'
                                : 'Tambahkan hari libur nasional atau cuti bersama baru'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Tanggal *</Label>
                            <Input
                                id="date"
                                type="date"
                                {...register('date')}
                                className={errors.date ? 'border-destructive' : ''}
                            />
                            {errors.date && (
                                <p className="text-sm text-destructive">{errors.date.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Hari Libur *</Label>
                            <Input
                                id="name"
                                placeholder="Contoh: Hari Kemerdekaan RI"
                                {...register('name')}
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi (Opsional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Deskripsi tambahan tentang hari libur ini..."
                                {...register('description')}
                                rows={3}
                            />
                        </div>

                        {isEditing && (
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Status Aktif</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Hari libur aktif akan diperhitungkan dalam sistem
                                    </p>
                                </div>
                                <Switch
                                    checked={isActiveValue}
                                    onCheckedChange={(checked) => setValue('is_active', checked)}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default HolidayFormDialog;
