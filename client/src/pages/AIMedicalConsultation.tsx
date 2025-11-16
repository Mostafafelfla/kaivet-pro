import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, Zap, AlertCircle, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AIMedicalConsultation() {
  const { user } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: clinics } = trpc.clinic.listByOwner.useQuery();
  const clinicId = selectedClinic || clinics?.[0]?.id;

  const { data: patients } = trpc.patient.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const { data: sessions } = trpc.chat.listSessions.useQuery();
  const { data: chatMessages } = trpc.chat.getMessages.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );

  const createSessionMutation = trpc.chat.createSession.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // Update messages when session messages change
  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateSession = async () => {
    if (!clinicId) return;

    try {
      const newSession = await createSessionMutation.mutateAsync({
        clinicId,
        patientId: selectedPatient || undefined,
        title: `Consultation - ${new Date().toLocaleDateString()}`,
        context: selectedPatient ? `Patient consultation session` : "General veterinary consultation",
      });

      if (newSession && "insertId" in newSession) {
        setSessionId(newSession.insertId as number);
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionId || isLoading) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        sessionId,
        content: userMessage,
      });

      if (response) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), sessionId, role: "user", content: userMessage },
          { id: Date.now() + 1, sessionId, role: "assistant", content: response.aiMessage },
        ]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sessionId,
          role: "system",
          content: "Sorry, I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Medical Consultation</h1>
        <p className="text-slate-600 mt-2">Get instant veterinary advice from our AI assistant</p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Zap className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>AI Assistant:</strong> This AI provides general veterinary guidance. Always consult with a licensed veterinarian for serious conditions or medical decisions.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consultation Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Clinic</label>
                <select
                  value={selectedClinic || ""}
                  onChange={(e) => setSelectedClinic(Number(e.target.value))}
                  className="w-full border rounded-md p-2 mt-1"
                >
                  <option value="">Select clinic</option>
                  {clinics?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Patient (Optional)</label>
                <select
                  value={selectedPatient || ""}
                  onChange={(e) => setSelectedPatient(e.target.value ? Number(e.target.value) : null)}
                  className="w-full border rounded-md p-2 mt-1"
                  disabled={!clinicId}
                >
                  <option value="">General consultation</option>
                  {patients?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {!sessionId ? (
                <Button
                  onClick={handleCreateSession}
                  disabled={!clinicId}
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Consultation
                </Button>
              ) : (
                <div className="p-3 bg-green-50 rounded-md text-sm text-green-800">
                  ✓ Consultation active
                </div>
              )}

              {sessions && sessions.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Previous Sessions</label>
                  <div className="space-y-2">
                    {sessions.map((session: any) => (
                      <button
                        key={session.id}
                        onClick={() => {
                          setSessionId(session.id);
                          setMessages([]);
                        }}
                        className="w-full text-left p-2 rounded-md hover:bg-slate-100 transition-colors text-sm"
                      >
                        <p className="font-medium text-slate-900">{session.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>AI Veterinary Assistant</CardTitle>
              <CardDescription>
                {selectedPatient ? "Patient-specific consultation" : "General veterinary consultation"}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-500">
                      {sessionId
                        ? "Start by asking a question about your patient's health"
                        : "Create a consultation session to begin"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : msg.role === "assistant"
                            ? "bg-slate-100 text-slate-900 rounded-bl-none"
                            : "bg-red-50 text-red-900 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            <div className="border-t p-4">
              {sessionId ? (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about symptoms, treatment, diagnosis..."
                    className="flex-1 resize-none"
                    rows={2}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="self-end"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-slate-500 text-center">
                  Create a consultation session to start chatting
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Common Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Common Questions</CardTitle>
          <CardDescription>Click to ask the AI assistant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "What are the symptoms of common pet diseases?",
              "How often should pets be vaccinated?",
              "What should I do if my pet is injured?",
              "What are the signs of allergies in animals?",
              "How can I help my pet recover from surgery?",
              "What are the best preventive care practices?",
            ].map((question, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputValue(question);
                  if (sessionId) {
                    handleSendMessage({ preventDefault: () => {} } as any);
                  }
                }}
                className="p-3 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
