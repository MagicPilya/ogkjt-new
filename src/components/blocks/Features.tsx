import { GraduationCap, Briefcase, Building2, TrainFront } from "lucide-react";

const features = [
    {
        icon: Briefcase,
        title: "Гарантированное трудоустройство",
        description: "100% выпускников получают первое рабочее место на предприятиях Белорусской железной дороги."
    },
    {
        icon: Building2,
        title: "Общежитие всем желающим",
        description: "Комфортабельное общежитие предоставляется всем иногородним учащимся на весь период обучения."
    },
    {
        icon: TrainFront,
        title: "Практика на реальных объектах",
        description: "Производственное обучение проходит в депо и на станциях БЖД с использованием современного оборудования."
    },
    {
        icon: GraduationCap,
        title: "Высокое качество образования",
        description: "Опытные преподаватели и современные методики обучения обеспечивают высокий уровень подготовки специалистов."
    }
];

export function Features() {
    return (
        <section className="py-24 bg-white dark:bg-slate-950">
            <div className="container">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
                        Почему выбирают нас?
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Мы создаем условия для профессионального роста и комфортного обучения каждого студента.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                                <feature.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

