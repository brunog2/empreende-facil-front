import { LockKeyhole, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FeatureUpgradeCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const navigate = useNavigate();
  return (
    <Card className="border-dashed border-primary/30 bg-primary/[0.03]">
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => navigate("/planos")}>
          <Sparkles className="mr-2 h-4 w-4" />
          Conhecer planos com este recurso
        </Button>
      </CardContent>
    </Card>
  );
}
