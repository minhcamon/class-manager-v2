import api from "@/lib/axios";
import type { Class, ClassCreateRequest } from "@/types/class";
import type { APIResponse } from "./authService";

const classService = {
  createClass: async (data: ClassCreateRequest): Promise<Class> => {
    const response = await api.post<APIResponse<Class>>("/classes", data);
    const cls = response.data.data;
    if (cls) {
      sessionStorage.setItem("active_class", JSON.stringify(cls));
    }
    return cls;
  },

  endClass: async (id: number): Promise<Class> => {
    const response = await api.put<APIResponse<Class>>(`/classes/${id}/end`);
    sessionStorage.removeItem("active_class");
    return response.data.data;
  },

  getClass: async (id: number): Promise<Class> => {
    const response = await api.get<APIResponse<Class>>(`/classes/${id}`);
    return response.data.data;
  },

  getClassById: async (id: number): Promise<Class> => {
    const response = await api.get<APIResponse<Class>>(`/classes/${id}`);
    return response.data.data;
  },

  /**
   * Always fetches the active class from the API to ensure fresh data.
   * sessionStorage cache is only used as a fallback when the API call fails.
   * This prevents stale IDs from causing 404s after class end/re-create cycles.
   */
  getActiveClass: async (): Promise<Class | null> => {
    try {
      const response = await api.get<APIResponse<Class | null>>("/classes/active");
      const cls = response.data.data;
      if (cls) {
        sessionStorage.setItem("active_class", JSON.stringify(cls));
      } else {
        sessionStorage.removeItem("active_class");
      }
      return cls;
    } catch (e) {
      // Fallback: return cached data only if API is unreachable
      const cached = sessionStorage.getItem("active_class");
      if (cached) {
        try {
          console.warn("API unreachable, using cached active class as fallback.");
          return JSON.parse(cached) as Class;
        } catch {
          sessionStorage.removeItem("active_class");
        }
      }
      throw e;
    }
  },
};

export default classService;
