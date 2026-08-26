import { hotelService } from "@/server/modules/hotel/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ slug: string }> }) => {
    const { slug } = await context.params;
    const hotel = await hotelService.getBySlug(slug);
    return apiSuccess(hotel);
  },
);
