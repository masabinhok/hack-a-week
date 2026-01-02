import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all categories with service counts
   */
  async findAll() {
    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: {
            services: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        serviceCount: cat._count.services,
      })),
      total: categories.length,
    };
  }

  /**
   * Get a single category by slug
   */
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category '${slug}' not found`);
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      serviceCount: category._count.services,
    };
  }

  /**
   * Get services in a category
   * Returns only root services (level 0) that belong to this category
   */
  async findServicesByCategory(slug: string) {
    // First check if category exists
    const category = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });

    if (!category) {
      throw new NotFoundException(`Category '${slug}' not found`);
    }

    // Get services in this category
    const serviceCategories = await this.prisma.serviceCategory.findMany({
      where: { categoryId: category.id },
      include: {
        service: {
          select: {
            id: true,
            serviceId: true,
            name: true,
            slug: true,
            description: true,
            priority: true,
            level: true,
            isOnlineEnabled: true,
            _count: {
              select: {
                children: true,
                serviceSteps: true,
              },
            },
          },
        },
      },
    });

    // Filter to show only root services (level 0) or leaf services (with steps)
    const services = serviceCategories
      .map((sc) => sc.service)
      .filter((s) => s.level === 0 || s._count.serviceSteps > 0)
      .map((s) => ({
        id: s.id,
        serviceId: s.serviceId,
        name: s.name,
        slug: s.slug,
        description: s.description,
        priority: s.priority,
        level: s.level,
        isOnlineEnabled: s.isOnlineEnabled,
        childrenCount: s._count.children,
        hasSteps: s._count.serviceSteps > 0,
      }));

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      services,
      total: services.length,
    };
  }
}
