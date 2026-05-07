import axios from "axios";

export interface IEmbedPage {
  id: number;
  title: string;
  link: string;
}

interface IGetPagesResponse {
  pages: IEmbedPage[];
}

interface IInsertPagesResponse {
  success: boolean;
  data?: {
    success_message: string;
  };
}

interface ICreatePageResponse {
  url: string;
}

export class EmbedAPI {
  private static getAjaxUrl(): string {
    return (window as any).ajaxurl || "/wp-admin/admin-ajax.php";
  }

  private static getNonce(key: string): string {
    return (window as any).ccb_nonces?.[key] || "";
  }

  public static async getPages(): Promise<IEmbedPage[]> {
    const ajaxUrl = this.getAjaxUrl();
    const nonce = this.getNonce("embed_get_pages");

    try {
      const formData = new FormData();
      formData.append("action", "embed-get-pages");
      formData.append("nonce", nonce);

      const response = await axios.post<IGetPagesResponse>(ajaxUrl, formData);
      return response.data.pages || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  }

  public static async insertPages(
    pages: IEmbedPage[],
    calculatorId: number,
  ): Promise<IInsertPagesResponse> {
    const ajaxUrl = this.getAjaxUrl();
    const nonce = this.getNonce("embed_insert_pages");

    try {
      const formData = new FormData();
      formData.append("action", "embed-insert-pages");
      formData.append("nonce", nonce);
      formData.append(
        "data",
        JSON.stringify({
          pages,
          calculator_id: calculatorId,
        }),
      );

      const response = await axios.post<IInsertPagesResponse>(
        ajaxUrl,
        formData,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  }

  public static async createPage(
    pageName: string,
    calculatorId: number,
  ): Promise<ICreatePageResponse> {
    const ajaxUrl = this.getAjaxUrl();
    const nonce = this.getNonce("embed_create_page");

    try {
      const formData = new FormData();
      formData.append("action", "embed-create-page");
      formData.append("nonce", nonce);
      formData.append(
        "data",
        JSON.stringify({
          page_name: pageName,
          calculator_id: calculatorId,
        }),
      );

      const response = await axios.post<ICreatePageResponse>(ajaxUrl, formData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  }
}
