"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Search,
  Globe,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Plus,
  Settings,
} from "lucide-react";

export default function Dashboard() {
  const metrics = [
    {
      title: "Visibility",
      value: "73%",
      change: "+5.2%",
      trend: "up",
      icon: Eye,
      color: "text-blue-600",
    },
    {
      title: "Sentiment",
      value: "68%",
      change: "+2.1%",
      trend: "up",
      icon: Heart,
      color: "text-green-600",
    },
    {
      title: "Position",
      value: "#12",
      change: "-3",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Engagement",
      value: "892",
      change: "+124",
      trend: "up",
      icon: MessageSquare,
      color: "text-orange-600",
    },
  ];

  const competitors = [
    { domain: "competitor1.com", visibility: 82, sentiment: 71, position: 8 },
    { domain: "competitor2.com", visibility: 76, sentiment: 68, position: 11 },
    { domain: "competitor3.com", visibility: 71, sentiment: 65, position: 15 },
    {
      domain: "yourdomain.com",
      visibility: 73,
      sentiment: 68,
      position: 12,
      isYou: true,
    },
  ];

  const prompts = [
    "Analyze top performing content this month",
    "Compare sentiment across competitor domains",
    "Identify trending topics in our industry",
    "Track visibility changes over time",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Search Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Marketing team dashboard • Real-time insights
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-gray-100 ${metric.color}`}>
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <div
                    className={`flex items-center text-sm ${
                      metric.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{metric.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="visibility" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="visibility">Visibility</TabsTrigger>
                    <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                    <TabsTrigger value="position">Position</TabsTrigger>
                  </TabsList>
                  <TabsContent value="visibility" className="mt-6">
                    <div className="h-64 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-gray-600">Visibility trend chart</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Last 30 days performance
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="sentiment" className="mt-6">
                    <div className="h-64 bg-gradient-to-r from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Heart className="w-12 h-12 text-green-600 mx-auto mb-2" />
                        <p className="text-gray-600">
                          Sentiment analysis chart
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Emotional response trends
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="position" className="mt-6">
                    <div className="h-64 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                        <p className="text-gray-600">Position ranking chart</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Search position changes
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Competitor Analysis */}
            <Card className="bg-white mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Competitor Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitors.map((competitor, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        competitor.isYou
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {competitor.domain}
                            {competitor.isYou && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                You
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium text-gray-900">
                            {competitor.visibility}%
                          </p>
                          <p className="text-gray-500">Visibility</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-gray-900">
                            {competitor.sentiment}%
                          </p>
                          <p className="text-gray-500">Sentiment</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-gray-900">
                            #{competitor.position}
                          </p>
                          <p className="text-gray-500">Position</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Domain Info */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Domain Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Domain</p>
                    <p className="font-medium text-gray-900">yourdomain.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Authority Score
                    </p>
                    <Progress value={73} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1">73/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Backlinks</p>
                    <p className="font-medium text-gray-900">1,247</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Keywords</p>
                    <p className="font-medium text-gray-900">892</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Prompts */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Your Own Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prompts.map((prompt, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      {prompt}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
