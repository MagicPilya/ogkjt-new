import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getArticleBySlug, getArticles } from "@/lib/strapi";
import { formatDate, getStrapiMedia } from "@/lib/utils";
import Image from "next/image";

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

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

export async function generateStaticParams() {
    const { data: articles } = await getArticles(1, 100);
    return articles.map((item) => ({
        slug: item.slug,
    }));
}

export default async function NewsDetailPage({ params }: Props) {
    const { slug } = await params;
    const item = await getArticleBySlug(slug);

    if (!item) {
        notFound();
    }

    const imageUrl = getStrapiMedia(item.cover?.url || null);

    return (
        <div className="container py-12 max-w-4xl">
            <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-blue-600" asChild>
                <Link href="/news">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Вернуться к новостям
                </Link>
            </Button>

            <article>
                <div className="mb-8">
                    <div className="flex items-center text-sm text-slate-500 mb-4">
                        <Calendar className="mr-2 h-4 w-4" />
                        {item.date ? formatDate(item.date) : "Без даты"}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6">
                        {item.title}
                    </h1>
                </div>

                <div className="relative h-[400px] w-full overflow-hidden rounded-xl mb-10 bg-slate-100">
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={item.cover?.alternativeText || item.title}
                            fill
                            unoptimized
                            className="object-cover"
                            priority
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
