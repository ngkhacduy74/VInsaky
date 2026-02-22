import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DashboardRepository } from 'src/repositories/dashboard.repositories';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepo: DashboardRepository) {}

  async getDashboardStats(): Promise<BaseResponseDto<any>> {
    try {
      const [totalUsers, totalPosts, totalProducts, totalBanners] =
        await Promise.all([
          this.dashboardRepo.countUsers(),
          this.dashboardRepo.countPosts(),
          this.dashboardRepo.countProducts(),
          this.dashboardRepo.countBanners(),
        ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [todayNewUsers, todayNewPosts, todayNewProducts] =
        await Promise.all([
          this.dashboardRepo.countUsers({ createdAt: { $gte: today } }),
          this.dashboardRepo.countPosts({ createdAt: { $gte: today } }),
          this.dashboardRepo.countProducts({ createdAt: { $gte: today } }),
        ]);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const activeUsers = await this.dashboardRepo.countUsers({
        lastLoginAt: { $gte: yesterday },
      });

      const todayPageViews = todayNewUsers * 3;

      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

      const [postsByMonthAgg, userGrowthByMonthAgg] = await Promise.all([
        this.dashboardRepo.aggregatePostsByMonth(startOfYear, endOfYear),
        this.dashboardRepo.aggregateUsersByMonth(startOfYear, endOfYear),
      ]);

      const monthlyPosts = Array(12).fill(0);
      postsByMonthAgg.forEach(
        (item) => (monthlyPosts[item._id - 1] = item.count),
      );

      const monthlyUserGrowth = Array(12).fill(0);
      let cumulative = 0;
      for (let i = 0; i < 12; i++) {
        const monthData = userGrowthByMonthAgg.find(
          (item) => item._id === i + 1,
        );
        if (monthData) cumulative += monthData.count;
        monthlyUserGrowth[i] = cumulative;
      }

      const [recentPosts, topCategories] = await Promise.all([
        this.dashboardRepo.getRecentPosts(5),
        this.dashboardRepo.aggregateTopCategories(5),
      ]);

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      const dailyRegistrations =
        await this.dashboardRepo.aggregateDailyRegistrations(last7Days[0]);

      const registrationTrend = last7Days.map((date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayData = dailyRegistrations.find((item) => item._id === dateStr);
        return dayData ? dayData.count : 0;
      });

      // 7. Sản phẩm theo trạng thái (Mới / Cũ)
      const [newProductCount, secondHandProductCount] = await Promise.all([
        this.dashboardRepo.countProducts({ status: 'New' }),
        this.dashboardRepo.countProducts({ status: 'SecondHand' }),
      ]);

      const deviceDistribution = [
        { device: 'Desktop', percentage: 45 },
        { device: 'Mobile', percentage: 40 },
        { device: 'Tablet', percentage: 15 },
      ];

      const browserDistribution = [
        { browser: 'Chrome', percentage: 65 },
        { browser: 'Safari', percentage: 20 },
        { browser: 'Firefox', percentage: 8 },
        { browser: 'Edge', percentage: 5 },
        { browser: 'Others', percentage: 2 },
      ];

      const responseData = {
        summary: {
          totalUsers,
          totalPosts,
          totalProducts,
          totalBanners,
          activeUsers,
          todayNewUsers,
          todayNewPosts,
          todayNewProducts,
          todayPageViews,
          newProductCount,
          secondHandProductCount,
        },
        charts: {
          postsByMonth: monthlyPosts,
          userGrowth: monthlyUserGrowth,
          registrationTrend,
        },
        analytics: {
          devices: deviceDistribution,
          browsers: browserDistribution,
        },
        recentPosts,
        topCategories,
      };

      return {
        success: true,
        message: 'Lấy dữ liệu thống kê Dashboard thành công',
        data: responseData,
      };
    } catch (error: any) {
      console.error('Lỗi tại DashboardService:', error);
      throw new InternalServerErrorException(
        error.message || 'Lỗi hệ thống khi lấy dữ liệu thống kê',
      );
    }
  }
}
