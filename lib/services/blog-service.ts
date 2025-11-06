import { notFound } from "next/navigation";
import axiosClient from "../clients/axios-client";
import axios from "axios";

export const blogService = {
  async getAllBlogs(): Promise<GetBlogsResponse> {
    try {
      const response = await axiosClient.get<GetBlogsResponse>(
        `${process.env.BLOG_API_URL}/api/blogs`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BLOG_API_KEY}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error("Invalid API key");
      } else if (error.response?.status === 404) {
        console.error("No blogs found");
      } else {
        console.error("Error fetching blogs:", error.message);
      }
      throw error;
    }
  },

  async getBlogBySlug(slug: string): Promise<BlogWithAuthor> {
    try {
      const response = await axios.get<GetBlogResponse>(
        `${process.env.BLOG_API_URL}/api/blogs/${encodeURIComponent(slug)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BLOG_API_KEY}`,
          },
        }
      );
      return response.data.blog;
    } catch (error: any) {
      if (error.response?.status === 404) {
        notFound();
      }
      if (error.response?.status === 401) {
        console.error("Invalid API key");
      }
      console.error("Error fetching blog:", error.message);
      throw error;
    }
  },
};
