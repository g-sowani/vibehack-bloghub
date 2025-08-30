import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [approvedBlogs, setApprovedBlogs] = useState([]);
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("approved");
  const [commentContent, setCommentContent] = useState("");
  const [commentingBlogId, setCommentingBlogId] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalBlogs: 0,
    totalLikes: 0,
    totalComments: 0,
    topBlogs: [],
    userStats: {
      blogsCreated: 0,
      totalLikes: 0,
      totalComments: 0
    }
  });
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole") || "user";
  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchBlogs();
    fetchAnalytics();
  }, [navigate]);

  const fetchBlogs = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      console.log("Fetching blogs with token:", token ? "Token exists" : "No token");
      
      const [approvedRes, pendingRes] = await Promise.all([
        axios.get("/api/blogs/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/blogs/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log("Approved blogs response:", approvedRes.data);
      console.log("Pending blogs response:", pendingRes.data);

      // Sort approved blogs and mark top 2 as trending
      const sortedApprovedBlogs = approvedRes.data
        .map(blog => ({ ...blog, isTrending: false })) // Initialize isTrending
        .sort((a, b) => b.likeCount - a.likeCount); // Sort by likeCount descending

      // Mark top 2 blogs as trending (adjust number or criteria as needed)
      const topBlogsCount = Math.min(2, sortedApprovedBlogs.length);
      for (let i = 0; i < topBlogsCount; i++) {
        if (sortedApprovedBlogs[i].likeCount > 0) { // Only mark as trending if likes > 0
          sortedApprovedBlogs[i].isTrending = true;
        }
      }

      setApprovedBlogs(sortedApprovedBlogs);
      setPendingBlogs(pendingRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);
      
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (err.code === "ECONNREFUSED") {
        setError("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setError(
          `Failed to fetch blogs: ${err.response?.statusText || err.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    const token = localStorage.getItem("token");
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        axios.get("/api/blogs/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/blogs/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allBlogs = [...approvedRes.data, ...pendingRes.data];
      
      // Calculate analytics
      const totalBlogs = allBlogs.length;
      const totalLikes = allBlogs.reduce((sum, blog) => sum + (blog.likeCount || 0), 0);
      const totalComments = allBlogs.reduce((sum, blog) => sum + (blog.comments?.length || 0), 0);
      
      // Get top blogs by likes
      const topBlogs = allBlogs
        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
        .slice(0, 5);

      // Calculate user-specific stats
      const userId = localStorage.getItem("userId");
      const userBlogs = allBlogs.filter(blog => blog.author._id === userId);
      const userStats = {
        blogsCreated: userBlogs.length,
        totalLikes: userBlogs.reduce((sum, blog) => sum + (blog.likeCount || 0), 0),
        totalComments: userBlogs.reduce((sum, blog) => sum + (blog.comments?.length || 0), 0)
      };

      setAnalytics({
        totalBlogs,
        totalLikes,
        totalComments,
        topBlogs,
        userStats
      });
    } catch (err) {
      console.error("Analytics fetch error:", err);
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Creating blog with data:", { title, content });
      const response = await axios.post(
        "/api/blogs/",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Blog created successfully:", response.data);
      setTitle("");
      setContent("");
      setSuccess("Blog created successfully! It's now pending approval.");
      await fetchBlogs();
      await fetchAnalytics();
    } catch (err) {
      console.error("Create error:", err);
      console.error("Error response:", err.response);
      
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (err.code === "ECONNREFUSED") {
        setError("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setError(
          `Failed to create blog: ${err.response?.statusText || err.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBlog = async (blogId, status) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.put(
        `/api/blogs/${blogId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(
        `Blog ${status === "approved" ? "approved" : "rejected"} successfully!`
      );
      await fetchBlogs();
      await fetchAnalytics();
    } catch (err) {
      console.error("Approve error:", err.response?.data || err.message);
      setError(
        `Failed to update blog status: ${
          err.response?.statusText || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBlog = async (blogId) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try {
      await axios.post(
        `/api/blogs/${blogId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchBlogs();
      await fetchAnalytics();
    } catch (err) {
      console.error("Like error:", err.response?.data || err.message);
      setError(
        `Failed to like blog: ${err.response?.statusText || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (blogId) => {
    if (!commentContent.trim()) {
      setError("Please enter a comment");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try {
      await axios.post(
        `/api/blogs/${blogId}/comments`,
        { content: commentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentContent("");
      setCommentingBlogId(null);
      await fetchBlogs();
      await fetchAnalytics();
    } catch (err) {
      console.error("Comment error:", err.response?.data || err.message);
      setError(
        `Failed to add comment: ${err.response?.statusText || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (blogId, commentId) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try {
      await axios.delete(
        `/api/blogs/${blogId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchBlogs();
      await fetchAnalytics();
    } catch (err) {
      console.error("Delete comment error:", err.response?.data || err.message);
      setError(
        `Failed to delete comment: ${err.response?.statusText || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const isLikedByUser = (blog) => {
    return blog.likes && blog.likes.some(like => like._id === localStorage.getItem("userId"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Calculate max value for bar graph normalization
  const maxPlatformStats = Math.max(
    analytics.totalBlogs || 1,
    analytics.totalLikes || 1,
    analytics.totalComments || 1
  );
  const maxUserStats = Math.max(
    analytics.userStats.blogsCreated || 1,
    analytics.userStats.totalLikes || 1,
    analytics.userStats.totalComments || 1
  );

  // Calculate pie chart data for top blogs
  const totalTopLikes = analytics.topBlogs.reduce((sum, blog) => sum + (blog.likeCount || 0), 0);
  const pieChartData = analytics.topBlogs.map((blog, index) => {
    const percentage = totalTopLikes > 0 ? (blog.likeCount || 0) / totalTopLikes * 100 : 0;
    return { ...blog, percentage };
  });

  // Colors for pie chart slices
  const pieColors = [
    '#ff6b35', // Orange (primary theme color)
    '#51cf66', // Green (approved color)
    '#ff6b6b', // Red (reject color)
    '#4facfe', // Blue (user role color)
    '#f093fb'  // Pink (admin role color)
  ];

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">BlogHub</h1>
          <div className="user-info">
            <span className="welcome-text">Welcome, {username}</span>
            <span className={`role-badge ${userRole}`}>
              {userRole.toUpperCase()}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Loading Indicator */}
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {/* Messages */}
        {(error || success) && (
          <div className={`message ${error ? "error" : "success"}`}>
            <span>{error || success}</span>
            <button className="close-btn" onClick={clearMessages}>
              ×
            </button>
          </div>
        )}

        {/* Section 1: All Blogs */}
        <section className="blogs-section">
          <div className="section-header">
            <h2>All Blogs</h2>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === "approved" ? "active" : ""}`}
              onClick={() => setActiveTab("approved")}
            >
              Published Blogs ({approvedBlogs.length})
            </button>
            {userRole === "admin" ? (
              <button
                className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending Approval ({pendingBlogs.length})
              </button>
            ) : (
              <button
                className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                My Pending Blogs ({pendingBlogs.length})
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "approved" && (
              <div className="blogs-grid">
                {approvedBlogs.length > 0 ? (
                  approvedBlogs.map((blog) => (
                    <div key={blog._id} className="blog-card approved">
                      <div className="blog-header">
                        <h4 className="blog-title">
                          {blog.title}
                          {blog.isTrending && <span className="trending-star"> ⭐</span>}
                        </h4>
                        <span className={`status-badge ${blog.isTrending ? "trending" : "approved"}`}>
                          {blog.isTrending ? "Trending" : "Published"}
                        </span>
                      </div>
                      <p className="blog-content">{blog.content}</p>
                      <div className="blog-footer">
                        <span className="author">
                          By: {blog.author.username}
                        </span>
                        <span className="date">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Likes Section */}
                      <div className="blog-actions">
                        <button
                          className={`like-btn ${isLikedByUser(blog) ? 'liked' : ''}`}
                          onClick={() => handleLikeBlog(blog._id)}
                          disabled={loading}
                        >
                          {isLikedByUser(blog) ? '❤️' : '🤍'} {blog.likeCount} Likes
                        </button>
                      </div>

                      {/* Comments Section */}
                      <div className="comments-section">
                        <h5>Comments ({blog.comments ? blog.comments.length : 0})</h5>
                        
                        {/* Add Comment */}
                        <div className="add-comment">
                          <textarea
                            placeholder="Write a comment..."
                            value={commentingBlogId === blog._id ? commentContent : ""}
                            onChange={(e) => {
                              setCommentContent(e.target.value);
                              setCommentingBlogId(blog._id);
                            }}
                            className="comment-input"
                            rows="2"
                            maxLength="500"
                          />
                          <button
                            className="comment-btn"
                            onClick={() => handleAddComment(blog._id)}
                            disabled={loading || !commentContent.trim()}
                          >
                            Comment
                          </button>
                        </div>

                        {/* Display Comments */}
                        <div className="comments-list">
                          {blog.comments && blog.comments.map((comment) => (
                            <div key={comment._id} className="comment">
                              <div className="comment-header">
                                <span className="comment-author">{comment.username}</span>
                                <span className="comment-date">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                                {(comment.author === localStorage.getItem("userId") || userRole === "admin") && (
                                  <button
                                    className="delete-comment-btn"
                                    onClick={() => handleDeleteComment(blog._id, comment._id)}
                                    disabled={loading}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                              <p className="comment-content">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h4>No published blogs yet</h4>
                    <p>Be the first to create and publish a blog!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "pending" && (
              <div className="blogs-grid">
                <h3 className="section-title">
                  {userRole === "admin"
                    ? "Blogs Awaiting Approval"
                    : "Your Pending Blogs"}
                </h3>
                {pendingBlogs.length > 0 ? (
                  pendingBlogs.map((blog) => (
                    <div key={blog._id} className="blog-card pending">
                      <div className="blog-header">
                        <h4 className="blog-title">{blog.title}</h4>
                        <span className="status-badge pending">Pending</span>
                      </div>
                      <p className="blog-content">{blog.content}</p>
                      <div className="blog-footer">
                        <span className="author">
                          By: {blog.author.username}
                        </span>
                        <span className="date">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Likes Section */}
                      <div className="blog-actions">
                        <button
                          className={`like-btn ${isLikedByUser(blog) ? 'liked' : ''}`}
                          onClick={() => handleLikeBlog(blog._id)}
                          disabled={loading}
                        >
                          {isLikedByUser(blog) ? '❤️' : '🤍'} {blog.likeCount} Likes
                        </button>
                      </div>

                      {/* Comments Section */}
                      <div className="comments-section">
                        <h5>Comments ({blog.comments ? blog.comments.length : 0})</h5>
                        
                        {/* Add Comment */}
                        <div className="add-comment">
                          <textarea
                            placeholder="Write a comment..."
                            value={commentingBlogId === blog._id ? commentContent : ""}
                            onChange={(e) => {
                              setCommentContent(e.target.value);
                              setCommentingBlogId(blog._id);
                            }}
                            className="comment-input"
                            rows="2"
                            maxLength="500"
                          />
                          <button
                            className="comment-btn"
                            onClick={() => handleAddComment(blog._id)}
                            disabled={loading || !commentContent.trim()}
                          >
                            Comment
                          </button>
                        </div>

                        {/* Display Comments */}
                        <div className="comments-list">
                          {blog.comments && blog.comments.map((comment) => (
                            <div key={comment._id} className="comment">
                              <div className="comment-header">
                                <span className="comment-author">{comment.username}</span>
                                <span className="comment-date">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                                {(comment.author === localStorage.getItem("userId") || userRole === "admin") && (
                                  <button
                                    className="delete-comment-btn"
                                    onClick={() => handleDeleteComment(blog._id, comment._id)}
                                    disabled={loading}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                              <p className="comment-content">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {userRole === "admin" && (
                        <div className="admin-actions">
                          <button
                            className="approve-btn"
                            onClick={() =>
                              handleApproveBlog(blog._id, "approved")
                            }
                            disabled={loading}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() =>
                              handleApproveBlog(blog._id, "rejected")
                            }
                            disabled={loading}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h4>
                      {userRole === "admin"
                        ? "No blogs pending approval"
                        : "No pending blogs"}
                    </h4>
                    <p>
                      {userRole === "admin"
                        ? "All blogs have been reviewed!"
                        : "Create a blog using the form below to see it here."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Create Blog Form */}
        <section className="create-blog-section">
          <h2>Create New Blog Post</h2>
          <form className="blog-form" onSubmit={handleCreateBlog}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter blog title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                maxLength="100"
              />
              <span className="char-count">{title.length}/100</span>
            </div>
            <div className="form-group">
              <textarea
                placeholder="Write your blog content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="form-textarea"
                rows="6"
                maxLength="2000"
              />
              <span className="char-count">{content.length}/2000</span>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Publishing..." : "Publish Blog"}
            </button>
          </form>
        </section>

        {/* Section 3: Analytics Dashboard */}
        <section className="analytics-section">
          <h2>Analytics Dashboard</h2>
          <div className="analytics-grid">
            {/* Overall Stats */}
            <div className="analytics-card">
              <h3>Platform Overview</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{analytics.totalBlogs}</span>
                  <span className="stat-label">Total Blogs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{analytics.totalLikes}</span>
                  <span className="stat-label">Total Likes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{analytics.totalComments}</span>
                  <span className="stat-label">Total Comments</span>
                </div>
              </div>
              <div className="graph-container">
                <div className="graph-title">Platform Stats</div>
                <div className="graph-bars">
                  <div
                    className="graph-bar"
                    style={{ height: `${(analytics.totalBlogs / maxPlatformStats) * 100}%` }}
                  >
                    <span className="graph-bar-value">{analytics.totalBlogs}</span>
                    <span className="graph-bar-label">Blogs</span>
                  </div>
                  <div
                    className="graph-bar"
                    style={{ height: `${(analytics.totalLikes / maxPlatformStats) * 100}%` }}
                  >
                    <span className="graph-bar-value">{analytics.totalLikes}</span>
                    <span className="graph-bar-label">Likes</span>
                  </div>
                  <div
                    className="graph-bar"
                    style={{ height: `${(analytics.totalComments / maxPlatformStats) * 100}%` }}
                  >
                    <span className="graph-bar-value">{analytics.totalComments}</span>
                    <span className="graph-bar-label">Comments</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="analytics-card">
              <h3>Your Performance</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{analytics.userStats.blogsCreated}</span>
                  <span className="stat-label">Blogs Created</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{analytics.userStats.totalLikes}</span>
                  <span className="stat-label">Likes Received</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{analytics.userStats.totalComments}</span>
                  <span className="stat-label">Comments Received</span>
                </div>
              </div>
              <div className="graph-container">
                <div className="graph-title">Your Stats</div>
                <div className="graph-bars">
                  <div
                    className="graph-bar"
                    style={{ height: `${(analytics.userStats.blogsCreated / maxUserStats) * 100}%` }}
                  >
                    <span className="graph-bar-value">{analytics.userStats.blogsCreated}</span>
                    <span className="graph-bar-label">Blogs</span>
                  </div>
                  <div
                    className="graph-bar"
                    style={{ height: `${(analytics.userStats.totalLikes / maxUserStats) * 100}%` }}
                  >
                    <span className="graph-bar-value">{analytics.userStats.totalLikes}</span>
                    <span className="graph-bar-label">Likes</span>
                  </div>
                  <div
                    className="graph-bar"
                    style={{ height: `${(analytics.userStats.totalComments / maxUserStats) * 100}%` }}
                  >
                    <span className="graph-bar-value">{analytics.userStats.totalComments}</span>
                    <span className="graph-bar-label">Comments</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Blogs */}
            <div className="analytics-card full-width">
              <h3>Top Performing Blogs</h3>
              <div className="pie-chart-container">
                <div className="pie-chart-wrapper">
                  <div
                    className="pie-chart"
                    style={{
                      background: totalTopLikes > 0
                        ? `conic-gradient(
                            ${pieChartData.map((blog, index) => {
                              const startAngle = index === 0 ? 0 : pieChartData.slice(0, index).reduce((sum, b) => sum + b.percentage, 0);
                              const endAngle = startAngle + blog.percentage;
                              return `${pieColors[index % pieColors.length]} ${startAngle}% ${endAngle}%`;
                            }).join(', ')})`
                        : 'conic-gradient(#e5e7eb 0% 100%)'
                    }}
                  ></div>
                </div>
                <div className="pie-legend">
                  {pieChartData.length > 0 ? (
                    pieChartData.map((blog, index) => (
                      <div key={blog._id} className="pie-legend-item">
                        <span
                          className="pie-legend-color"
                          style={{ backgroundColor: pieColors[index % pieColors.length] }}
                        ></span>
                        <span className="pie-legend-text">
                          #{index + 1} {blog.title} ({blog.likeCount || 0} Likes)
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No blogs available for ranking</p>
                  )}
                </div>
              </div>
              <div className="top-blogs-list">
                {analytics.topBlogs.length > 0 ? (
                  analytics.topBlogs.map((blog, index) => (
                    <div key={blog._id} className="top-blog-item">
                      <div className="blog-rank">#{index + 1}</div>
                      <div className="blog-info">
                        <h4>{blog.title}</h4>
                        <p>By: {blog.author.username}</p>
                      </div>
                      <div className="blog-stats">
                        <span className="stat">❤️ {blog.likeCount || 0}</span>
                        <span className="stat">💬 {blog.comments?.length || 0}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No blogs available for ranking</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;