import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getArticleBySlug } from "@/lib/strapi";
import { formatDate, getStrapiMedia } from "@/lib/utils";

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const item = await getArticleBySlug(slug);

    if (!item) {
        return {
            title: "Новость не найдена",
        };
    }

    return {
        title: `${item.title} | МГЖК`,
        description: item.announcement,
    };
}

export default async function NewsDetailPage({ params }: Props) {
    const { slug } = await params;
    const item = await getArticleBySlug(slug);

    if (!item) {
        notFound();
    }

    const imageUrl = getStrapiMedia(item.cover?.url || null);

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="flex justify-center mb-8">
                <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600" asChild>
                    <Link href="/news">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Вернуться к новостям
                    </Link>
                </Button>
            </div>

            <article>
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center text-sm text-slate-500 mb-4">
                        <Calendar className="mr-2 h-4 w-4" />
                        {item.date ? formatDate(item.date) : "Без даты"}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6">
                        {item.title}
                    </h1>
                </div>

                <div className="relative h-[400px] w-full overflow-hidden rounded-xl mb-10 bg-slate-100">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={item.cover?.alternativeText || item.title}
                            loading="eager"
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none lg:prose-lg">
                    <p className="lead text-xl text-slate-600 dark:text-slate-300 mb-6">
                        {item.announcement}
                    </p>
                    
                    {/* TODO: Render Blocks/Rich Text content properly */}
                    {item.content && item.content.map((block: any, index: number) => {
                        // Basic renderer for Strapi Blocks
                        if (block.type === 'paragraph') {
                             return (
                                <p key={index}>
                                    {block.children.map((child: any, childIndex: number) => {
                                        if (child.type === 'text') {
                                            let text = child.text;
                                            if (child.bold) text = <strong key={childIndex}>{text}</strong>;
                                            if (child.italic) text = <em key={childIndex}>{text}</em>;
                                            if (child.underline) text = <u key={childIndex}>{text}</u>;
                                            // Add more formatting here if needed
                                            return <span key={childIndex}>{text}</span>;
                                        }
                                        return null;
                                    })}
                                </p>
                             );
                        }
                        if (block.type === 'heading') {
                            const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
                            return (
                                <Tag key={index}>
                                     {block.children.map((child: any, childIndex: number) => child.text).join('')}
                                </Tag>
                            );
                        }
                        if (block.type === 'list') {
                            const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
                            return (
                                <ListTag key={index}>
                                    {block.children.map((item: any, itemIndex: number) => (
                                        <li key={itemIndex}>
                                            {item.children.map((child: any, childIndex: number) => child.text).join('')}
                                        </li>
                                    ))}
                                </ListTag>
                            )
                        }
                        return null;
                    })}
                </div>
            </article>
        </div>
    );
}
