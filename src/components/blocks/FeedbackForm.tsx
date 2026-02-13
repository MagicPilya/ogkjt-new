"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";

export function FeedbackForm() {
    return (
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
            <div className="container mx-auto px-4 max-w-4xl">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Есть вопросы?</CardTitle>
                        <CardDescription>
                            Напишите нам, и мы ответим в ближайшее время. Это анонимно, если вы не укажете контакты.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Ваше имя (необязательно)</label>
                                    <Input id="name" placeholder="Иван Иванов" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="contact" className="text-sm font-medium">Email или телефон (для ответа)</label>
                                    <Input id="contact" placeholder="+375 (XX) XXX-XX-XX" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium">Сообщение</label>
                                <Textarea
                                    id="message"
                                    placeholder="Текст вашего обращения..."
                                    className="min-h-[120px]"
                                />
                            </div>

                            <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                                <Send className="mr-2 h-4 w-4" />
                                Отправить сообщение
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
