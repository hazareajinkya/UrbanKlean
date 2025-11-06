import { notFound } from "next/navigation";
import axiosClient, { blogClient } from "../clients/axios-client";
import axios from "axios";

export const blogService = {
  async getAllBlogs(): Promise<GetBlogsResponse> {
    try {
      const response = await blogClient.get<GetBlogsResponse>("/blogs");
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
      const response = await blogClient.get<GetBlogResponse>(
        `/blogs/${encodeURIComponent(slug)}`
      );
      return response.data.blog;
    } catch (error: any) {
      if (error.response?.status === 404) {
        notFound();
      } else if (error.response?.status === 401) {
        console.error("Invalid API key");
      } else {
        console.error("Error fetching blog:", error.message);
      }
      throw error;
    }
  },
};
